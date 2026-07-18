import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { auth } from "@/auth";
import User from "@/models/User";
import Team from "@/models/Team";
import Deal from "@/models/Deal";
import Score from "@/models/Score";
import Notification from "@/models/Notification";
import Award from "@/models/Award";
import JudgeReview from "@/models/JudgeReview";
import ClientContact from "@/models/ClientContact";
import TeamMessage from "@/models/TeamMessage";
import DailyBriefing from "@/models/DailyBriefing";
import Lead from "@/models/Lead";

// ─── ADMIN EVENT MEMORY CACHE ────────────────────────────────────────────────
interface CacheEntry {
  data: any;
  timestamp: number;
}
let eventCache: CacheEntry | null = null;
const CACHE_TTL = 3000; // 3-second cache to prevent DB overhead during SWR polling

function invalidateEventCache() {
  eventCache = null;
}

// ─── GET: Fetch current event state ───────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth();

    const now = Date.now();
    if (eventCache && now - eventCache.timestamp < CACHE_TTL) {
      return NextResponse.json(eventCache.data);
    }

    await dbConnect();

    // Select public / authenticated fields
    const selectFields = session?.user
      ? "name slug status currentDay totalDays startDate endDate broadcastMessages demoMode"
      : "name slug status currentDay totalDays demoMode";

    const event = await Event.findOne({ status: { $in: ["active", "paused", "registration", "completed"] } })
      .select(selectFields)
      .lean();

    const resData = event
      ? { event }
      : {
          event: {
            _id: null,
            name: "GWD BizSim 2026",
            slug: "bizsim-2026",
            status: "active",
            currentDay: 4,
            totalDays: 9,
            broadcastMessages: [],
            demoMode: true,
          },
        };

    eventCache = { data: resData, timestamp: now };
    return NextResponse.json(resData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PUT: Admin event controls ─────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!["admin", "organizer"].includes(userRole)) {
      return NextResponse.json(
        { error: "Forbidden — admin or organizer role required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { action, broadcastMessage, demoMode } = body;

    let event = await Event.findOne({ status: { $in: ["active", "paused", "registration", "completed"] } });

    if (!event) {
      event = await Event.create({
        name: "GWD BizSim 2026",
        slug: "bizsim-2026",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        currentDay: 4,
        totalDays: 9,
        maxParticipants: 200,
        registrationFee: 2999,
        broadcastMessages: [],
        demoMode: true,
      });
    }

    switch (action) {
      case "advance_day": {
        if (event.currentDay >= event.totalDays) {
          return NextResponse.json(
            { error: "Simulation has already reached the final day" },
            { status: 400 }
          );
        }
        event.currentDay += 1;
        if (event.currentDay === event.totalDays) {
          event.status = "completed";
        }
        await event.save();
        invalidateEventCache();
        try {
          const { clearLeaderboardCache } = await import("@/app/api/leaderboard/route");
          clearLeaderboardCache();
        } catch (e) {
          console.error("Failed to clear leaderboard cache on advance:", e);
        }
        return NextResponse.json({
          message: `Advanced to Day ${event.currentDay}`,
          event: { currentDay: event.currentDay, status: event.status },
        });
      }

      case "rewind_day": {
        if (event.currentDay <= 1) {
          return NextResponse.json(
            { error: "Simulation is already at Day 1" },
            { status: 400 }
          );
        }
        event.currentDay -= 1;
        if (event.status === "completed") {
          event.status = "active";
        }
        await event.save();
        invalidateEventCache();
        try {
          const { clearLeaderboardCache } = await import("@/app/api/leaderboard/route");
          clearLeaderboardCache();
        } catch (e) {
          console.error("Failed to clear leaderboard cache on rewind:", e);
        }
        return NextResponse.json({
          message: `Rewound to Day ${event.currentDay}`,
          event: { currentDay: event.currentDay, status: event.status },
        });
      }

      case "set_day": {
        const { targetDay } = body;
        const dayNum = Number(targetDay);
        if (isNaN(dayNum) || dayNum < 1 || dayNum > event.totalDays) {
          return NextResponse.json(
            { error: `Invalid target day: must be between 1 and ${event.totalDays}` },
            { status: 400 }
          );
        }
        event.currentDay = dayNum;
        if (event.currentDay === event.totalDays) {
          event.status = "completed";
        } else if (event.status === "completed") {
          event.status = "active";
        }
        await event.save();
        invalidateEventCache();
        try {
          const { clearLeaderboardCache } = await import("@/app/api/leaderboard/route");
          clearLeaderboardCache();
        } catch (e) {
          console.error("Failed to clear leaderboard cache on jump:", e);
        }
        return NextResponse.json({
          message: `Jumped to Day ${event.currentDay}`,
          event: { currentDay: event.currentDay, status: event.status },
        });
      }

      case "complete_event": {
        event.status = "completed";
        await event.save();
        invalidateEventCache();
        return NextResponse.json({ message: "Simulation completed manually", event: { status: "completed" } });
      }

      case "reset_event": {
        // Reset Event counters and state
        event.currentDay = 1;
        event.status = "active";
        event.broadcastMessages = [];
        
        const actualParticipants = await User.countDocuments({ role: "participant", eventId: event._id });
        const actualTeams = await Team.countDocuments({ eventId: event._id });
        
        event.totalParticipants = actualParticipants;
        event.totalTeams = actualTeams;
        event.totalDealsSubmitted = 0;
        event.totalDealsVerified = 0;
        event.totalRevenue = 0;
        await event.save();

        // Reset User scores and tiers
        await User.updateMany(
          { eventId: event._id },
          { $set: { orbitScore: 0, tier: "member" } }
        );

        // Reset Team aggregates
        await Team.updateMany(
          { eventId: event._id },
          { $set: { totalScore: 0, totalRevenue: 0, totalDeals: 0, rank: null } }
        );

        // Reset Lead claim/contact statuses
        await Lead.updateMany(
          { eventId: event._id },
          { $set: { status: "available", assignedTeamId: null, claimedByUserId: null } }
        );

        // Delete Event-scoped models
        const deals = await Deal.find({ eventId: event._id }).select("_id").lean();
        const dealIds = deals.map(d => d._id);

        const teams = await Team.find({ eventId: event._id }).select("_id").lean();
        const teamIds = teams.map(t => t._id);

        await Promise.all([
          Deal.deleteMany({ eventId: event._id }),
          Score.deleteMany({ eventId: event._id }),
          Notification.deleteMany({ eventId: event._id }),
          Award.deleteMany({ eventId: event._id }),
          JudgeReview.deleteMany({ eventId: event._id }),
          ClientContact.deleteMany({ dealId: { $in: dealIds } }),
          TeamMessage.deleteMany({ teamId: { $in: teamIds } }),
          DailyBriefing.deleteMany({ eventId: event._id })
        ]);

        invalidateEventCache();
        try {
          const { clearLeaderboardCache } = await import("@/app/api/leaderboard/route");
          clearLeaderboardCache();
        } catch (e) {
          console.error("Failed to clear leaderboard cache on reset:", e);
        }

        return NextResponse.json({
          message: "Simulation reset successfully",
          event: {
            currentDay: event.currentDay,
            status: event.status,
            totalDealsSubmitted: 0,
            totalDealsVerified: 0,
            totalRevenue: 0,
          }
        });
      }

      case "pause": {
        event.status = "paused";
        await event.save();
        invalidateEventCache();
        return NextResponse.json({ message: "Simulation paused", event: { status: "paused" } });
      }

      case "resume": {
        event.status = "active";
        await event.save();
        invalidateEventCache();
        return NextResponse.json({ message: "Simulation resumed", event: { status: "active" } });
      }

      case "toggle_demo": {
        event.demoMode = demoMode ?? !event.demoMode;
        await event.save();
        invalidateEventCache();
        return NextResponse.json({
          message: `Demo mode ${event.demoMode ? "enabled" : "disabled"}`,
          event: { demoMode: event.demoMode },
        });
      }

      case "broadcast": {
        if (!broadcastMessage?.trim()) {
          return NextResponse.json({ error: "Broadcast message is required" }, { status: 400 });
        }

        const entry = {
          time: new Date().toISOString(),
          title: "Admin System Broadcast",
          message: broadcastMessage.trim(),
          sentBy: (session.user as any)?.name || "GWD Admin",
        };

        if (!Array.isArray(event.broadcastMessages)) {
          event.broadcastMessages = [];
        }
        event.broadcastMessages.unshift(entry);
        event.broadcastMessages = event.broadcastMessages.slice(0, 20);
        await event.save();
        invalidateEventCache();

        return NextResponse.json({
          message: "Broadcast dispatched",
          broadcast: entry,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
