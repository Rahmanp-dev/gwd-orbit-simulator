import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import Event from "@/models/Event";

/**
 * GET /api/teams — List all teams for the current event.
 * Staff roles (admin/organizer/judge) get full member details.
 * Participants get a lightweight summary.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    // Resolve eventId from the active event if not provided
    let resolvedEventId = eventId;
    if (!resolvedEventId) {
      const event = await Event.findOne({
        status: { $in: ["active", "paused", "registration", "completed"] },
      })
        .sort({ createdAt: -1 })
        .select("_id")
        .lean();
      resolvedEventId = event?._id?.toString() ?? null;
    }

    if (!resolvedEventId) {
      return NextResponse.json({ teams: [] });
    }

    const teams = await Team.find({ eventId: resolvedEventId }).lean()
      .select("name emoji totalScore totalRevenue totalDeals captainId memberIds nicheId")
      .populate("captainId", "name avatar")
      .populate("memberIds", "name avatar participantRole orbitScore tier")
      .populate("nicheId", "name icon color")
      .sort({ totalScore: -1 })
      .lean();

    return NextResponse.json({ teams });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
