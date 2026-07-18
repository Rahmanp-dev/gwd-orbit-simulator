import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Award from "@/models/Award";
import Team from "@/models/Team";
import User from "@/models/User";
import Event from "@/models/Event";

/**
 * GET /api/awards — Fetch awards for the finale page.
 * Returns top-3 teams + individual award recipients.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const event = await Event.findOne({ status: { $in: ["active", "paused", "completed"] } })
      .sort({ createdAt: -1 })
      .lean();

    if (!event) {
      return NextResponse.json({ error: "No event found" }, { status: 404 });
    }

    const [topTeams, awards, topIndividuals] = await Promise.all([
      Team.find({ eventId: event._id }).lean()
        .select("name emoji totalScore totalRevenue totalDeals nicheId")
        .populate("nicheId", "name icon color")
        .sort({ totalScore: -1 })
        .limit(3)
        .lean(),
      Award.find({ eventId: event._id }).lean()
        .populate("teamId", "name emoji")
        .populate("userId", "name avatar participantRole")
        .sort({ awardedAt: -1 })
        .lean(),
      User.find({ role: "participant", eventId: event._id }).lean()
        .select("name avatar participantRole orbitScore tier teamId")
        .populate("teamId", "name emoji")
        .sort({ orbitScore: -1 })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      topTeams: topTeams.map((t, i) => ({ ...t, rank: i + 1 })),
      awards,
      topIndividuals: topIndividuals.map((u, i) => ({ ...u, rank: i + 1 })),
      eventStatus: event.status,
      currentDay: (event as any).currentDay,
      totalDays: (event as any).totalDays,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
