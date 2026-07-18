import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import Deal from "@/models/Deal";
import Event from "@/models/Event";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const { id: teamId } = await params;
    if (!teamId) {
       return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const team = await Team.findById(teamId)
      .populate('memberIds', 'name avatar participantRole orbitScore')
      .populate('captainId', 'name avatar')
      .populate('nicheId', 'name icon color description')
      .lean();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const activeEvent = await Event.findOne({ status: { $in: ["active", "paused", "registration", "completed"] } }).sort({ createdAt: -1 });
    
    const filter: Record<string, unknown> = { teamId };
    if (activeEvent) filter.eventId = activeEvent._id;

    const verifiedDeals = await Deal.find(filter)
      .select('clientName serviceType dealValue gwdFinalDealValue gwdPaymentConfirmedAt status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ team, verifiedDeals });
  } catch (error: any) {
    console.error("Team GET Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
