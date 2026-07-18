import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import Team from "@/models/Team";
import Deal from "@/models/Deal";
import TeamMessage from "@/models/TeamMessage";
import Lead from "@/models/Lead";
import Score from "@/models/Score";
import Event from "@/models/Event";
import Niche from "@/models/Niche";
import DailyBriefing from "@/models/DailyBriefing";
import Notification from "@/models/Notification";
import JudgeReview from "@/models/JudgeReview";
import Award from "@/models/Award";
import ClientContact from "@/models/ClientContact";
import { auth } from "@/auth";

/**
 * GET /api/admin/backup — Export a complete JSON snapshot of all database collections.
 * Restricted to admin and organizer roles.
 */
export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session?.user || !["admin", "organizer"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden — Admin / Organizer access required" }, { status: 403 });
    }

    await dbConnect();

    const [
      events,
      users,
      teams,
      deals,
      messages,
      leads,
      scores,
      notifications,
      dailyBriefings,
      judgeReviews,
      awards,
      clientContacts,
      niches,
    ] = await Promise.all([
      Event.find({}).lean(),
      User.find({}).select("-password").lean(),
      Team.find({}).lean(),
      Deal.find({}).lean(),
      TeamMessage.find({}).lean(),
      Lead.find({}).lean(),
      Score.find({}).lean(),
      Notification.find({}).lean(),
      DailyBriefing.find({}).lean(),
      JudgeReview.find({}).lean(),
      Award.find({}).lean(),
      ClientContact.find({}).lean(),
      Niche.find({}).lean(),
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      exportedBy: (session.user as any)?.email,
      summary: {
        eventsCount: events.length,
        usersCount: users.length,
        teamsCount: teams.length,
        dealsCount: deals.length,
        messagesCount: messages.length,
        leadsCount: leads.length,
        scoresCount: scores.length,
        notificationsCount: notifications.length,
        dailyBriefingsCount: dailyBriefings.length,
        judgeReviewsCount: judgeReviews.length,
        awardsCount: awards.length,
        clientContactsCount: clientContacts.length,
        nichesCount: niches.length,
      },
      data: {
        events,
        users,
        teams,
        deals,
        messages,
        leads,
        scores,
        notifications,
        dailyBriefings,
        judgeReviews,
        awards,
        clientContacts,
        niches,
      },
    };

    return new Response(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="gwd_orbit_backup_${Date.now()}.json"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Backup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/backup — Restore database from a uploaded JSON snapshot payload.
 * Restricted to admin and organizer roles.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session?.user || !["admin", "organizer"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden — Admin / Organizer access required" }, { status: 403 });
    }

    const payload = await req.json();
    if (!payload || !payload.data) {
      return NextResponse.json({ error: "Invalid backup file: 'data' property is missing" }, { status: 400 });
    }

    const {
      events = [],
      users = [],
      teams = [],
      deals = [],
      messages = [],
      leads = [],
      scores = [],
      notifications = [],
      dailyBriefings = [],
      judgeReviews = [],
      awards = [],
      clientContacts = [],
      niches = [],
    } = payload.data;

    await dbConnect();

    // Preserve existing password hashes of current users to avoid locking them out
    const existingUsers = await User.find({}).select("email password").lean();
    const passwordMap = new Map<string, string>();
    for (const u of existingUsers) {
      if (u.email && u.password) {
        passwordMap.set(u.email.toLowerCase(), u.password);
      }
    }

    // Default fallback password hash for "BizSim2026"
    const defaultHashedPassword = await bcrypt.hash("BizSim2026", 10);

    // Prepare restored users list
    const preparedUsers = users.map((u: any) => {
      const emailLower = u.email ? u.email.toLowerCase() : "";
      const password = passwordMap.get(emailLower) || defaultHashedPassword;
      return {
        ...u,
        password,
      };
    });

    // Destructive drop of all 13 collections
    await Promise.all([
      Event.deleteMany({}),
      User.deleteMany({}),
      Team.deleteMany({}),
      Deal.deleteMany({}),
      TeamMessage.deleteMany({}),
      Lead.deleteMany({}),
      Score.deleteMany({}),
      Notification.deleteMany({}),
      DailyBriefing.deleteMany({}),
      JudgeReview.deleteMany({}),
      Award.deleteMany({}),
      ClientContact.deleteMany({}),
      Niche.deleteMany({}),
    ]);

    // Restore data with insertMany
    // We use Promise.all to load collections in parallel
    await Promise.all([
      events.length ? Event.insertMany(events, { ordered: false }) : Promise.resolve(),
      preparedUsers.length ? User.insertMany(preparedUsers, { ordered: false }) : Promise.resolve(),
      teams.length ? Team.insertMany(teams, { ordered: false }) : Promise.resolve(),
      deals.length ? Deal.insertMany(deals, { ordered: false }) : Promise.resolve(),
      messages.length ? TeamMessage.insertMany(messages, { ordered: false }) : Promise.resolve(),
      leads.length ? Lead.insertMany(leads, { ordered: false }) : Promise.resolve(),
      scores.length ? Score.insertMany(scores, { ordered: false }) : Promise.resolve(),
      notifications.length ? Notification.insertMany(notifications, { ordered: false }) : Promise.resolve(),
      dailyBriefings.length ? DailyBriefing.insertMany(dailyBriefings, { ordered: false }) : Promise.resolve(),
      judgeReviews.length ? JudgeReview.insertMany(judgeReviews, { ordered: false }) : Promise.resolve(),
      awards.length ? Award.insertMany(awards, { ordered: false }) : Promise.resolve(),
      clientContacts.length ? ClientContact.insertMany(clientContacts, { ordered: false }) : Promise.resolve(),
      niches.length ? Niche.insertMany(niches, { ordered: false }) : Promise.resolve(),
    ]);

    // Clear caches
    try {
      const { clearLeaderboardCache } = await import("@/app/api/leaderboard/route");
      clearLeaderboardCache();
    } catch (e) {
      console.error("Failed to clear leaderboard cache during backup restore:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Database successfully restored from backup snapshot",
      summary: {
        eventsRestored: events.length,
        usersRestored: preparedUsers.length,
        teamsRestored: teams.length,
        dealsRestored: deals.length,
        messagesRestored: messages.length,
        leadsRestored: leads.length,
        scoresRestored: scores.length,
        notificationsRestored: notifications.length,
        dailyBriefingsRestored: dailyBriefings.length,
        judgeReviewsRestored: judgeReviews.length,
        awardsRestored: awards.length,
        clientContactsRestored: clientContacts.length,
        nichesRestored: niches.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Restore failed";
    console.error("Restore endpoint error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
