import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EventSnapshot from "@/models/EventSnapshot";
import Event from "@/models/Event";
import User from "@/models/User";
import Team from "@/models/Team";
import Deal from "@/models/Deal";
import TeamMessage from "@/models/TeamMessage";
import Lead from "@/models/Lead";
import Score from "@/models/Score";
import Notification from "@/models/Notification";
import DailyBriefing from "@/models/DailyBriefing";
import JudgeReview from "@/models/JudgeReview";
import Award from "@/models/Award";
import ClientContact from "@/models/ClientContact";
import Niche from "@/models/Niche";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !["admin", "organizer"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden — Admin / Organizer access required" }, { status: 403 });
    }

    await dbConnect();

    // Find the current active/paused/registration/completed event
    const activeEvent = await Event.findOne({ status: { $in: ["active", "paused", "registration", "completed"] } }).lean();
    if (!activeEvent) {
      return NextResponse.json({ snapshots: [] });
    }

    const snapshots = await EventSnapshot.find({ eventId: activeEvent._id })
      .select("name description createdBy collectionCounts sizeBytes createdAt")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ snapshots });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    if (!session?.user || !["admin", "organizer"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden — Admin / Organizer access required" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Snapshot name is required" }, { status: 400 });
    }

    await dbConnect();

    const activeEvent = await Event.findOne({ status: { $in: ["active", "paused", "registration", "completed"] } });
    if (!activeEvent) {
      return NextResponse.json({ error: "No active event found to snapshot" }, { status: 404 });
    }

    // Limit snapshots count per event to 20 to prevent MongoDB size bloat
    const snapshotCount = await EventSnapshot.countDocuments({ eventId: activeEvent._id });
    if (snapshotCount >= 20) {
      // Auto-delete the oldest snapshot to maintain rotation
      const oldest = await EventSnapshot.findOne({ eventId: activeEvent._id }).sort({ createdAt: 1 });
      if (oldest) {
        await EventSnapshot.deleteOne({ _id: oldest._id });
      }
    }

    // Find team and deal ids to query event-scoped collections accurately
    const teamsList = await Team.find({ eventId: activeEvent._id }).select("_id").lean();
    const teamIds = teamsList.map(t => t._id);

    const dealsList = await Deal.find({ eventId: activeEvent._id }).select("_id").lean();
    const dealIds = dealsList.map(d => d._id);

    // Gather all data in parallel
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
      Event.find({ _id: activeEvent._id }).lean(),
      User.find({ eventId: activeEvent._id }).select("-password").lean(),
      Team.find({ eventId: activeEvent._id }).lean(),
      Deal.find({ eventId: activeEvent._id }).lean(),
      TeamMessage.find({ teamId: { $in: teamIds } }).lean(),
      Lead.find({ eventId: activeEvent._id }).lean(),
      Score.find({ eventId: activeEvent._id }).lean(),
      Notification.find({ eventId: activeEvent._id }).lean(),
      DailyBriefing.find({ eventId: activeEvent._id }).lean(),
      JudgeReview.find({ eventId: activeEvent._id }).lean(),
      Award.find({ eventId: activeEvent._id }).lean(),
      ClientContact.find({ dealId: { $in: dealIds } }).lean(),
      Niche.find({ eventId: activeEvent._id }).lean(),
    ]);

    const snapshotPayload = {
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
    };

    const collectionCounts = {
      events: events.length,
      users: users.length,
      teams: teams.length,
      deals: deals.length,
      scores: scores.length,
      leads: leads.length,
      niches: niches.length,
      notifications: notifications.length,
      dailyBriefings: dailyBriefings.length,
      judgeReviews: judgeReviews.length,
      awards: awards.length,
      clientContacts: clientContacts.length,
      teamMessages: messages.length,
    };

    const sizeBytes = Buffer.byteLength(JSON.stringify(snapshotPayload));

    const newSnapshot = await EventSnapshot.create({
      eventId: activeEvent._id,
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: userId,
      snapshotData: snapshotPayload,
      collectionCounts,
      sizeBytes,
    });

    return NextResponse.json({
      success: true,
      message: `Snapshot '${name}' created successfully`,
      snapshot: {
        _id: newSnapshot._id,
        name: newSnapshot.name,
        description: newSnapshot.description,
        collectionCounts: newSnapshot.collectionCounts,
        sizeBytes: newSnapshot.sizeBytes,
        createdAt: newSnapshot.createdAt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
