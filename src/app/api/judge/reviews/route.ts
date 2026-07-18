import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Deal from "@/models/Deal";
import JudgeReview from "@/models/JudgeReview";
import Event from "@/models/Event";
import Team from "@/models/Team"; // Ensure Team model is registered

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    // Allow judge or organizer
    if (!session?.user || (userRole !== "judge" && userRole !== "organizer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Find the active event
    const activeEvent = await Event.findOne({ status: { $in: ["active", "paused"] } }).sort({ createdAt: -1 });
    if (!activeEvent) {
      return NextResponse.json({ error: "No active event found" }, { status: 404 });
    }

    // Fetch deals with deliverables
    const deals = await Deal.find({
      eventId: activeEvent._id,
      "deliverables.0": { $exists: true } // Has at least one deliverable
    }).lean()
    .populate('teamId', 'name')
    .populate('dealArchitectId', 'name')
    .populate('deliveryAssignedTo', 'name')
    .sort({ createdAt: -1 })
    .lean();

    // Fetch existing reviews by THIS judge for this event
    const reviews = await JudgeReview.find({
      eventId: activeEvent._id,
      judgeId: (session.user as any).id
    }).lean();

    const reviewMap = new Map();
    for (const r of reviews) {
      reviewMap.set(r.dealId.toString(), r);
    }

    // Map deals to a format the frontend expects
    const formattedDeals = deals.map((deal: any) => {
      const review = reviewMap.get(deal._id.toString());
      return {
        id: deal._id.toString(),
        team: deal.teamId?.name || "Unknown Team",
        teamId: deal.teamId?._id?.toString(),
        client: deal.clientName,
        service: deal.serviceType,
        previewUrl: deal.deliverables[0]?.url || "#",
        revenue: deal.dealValue || 0,
        daOwner: deal.dealArchitectId?.name || "Unassigned",
        devOwner: deal.deliveryAssignedTo?.name || "Unassigned",
        scored: !!review,
        existingScore: review ? {
          design: review.designScore,
          technical: review.technicalScore,
          pitch: review.pitchScore,
          innovation: review.innovationScore,
          scalability: review.scalabilityScore,
          nomination: review.nominatedAward || "None"
        } : null,
        existingNote: review ? (review.feedback || "") : "",
        notes: deal.deliveryQA?.adminQaFeedback || "Deliverables submitted for review.",
      };
    });

    return NextResponse.json({ submissions: formattedDeals });
  } catch (error: any) {
    console.error("Judge Reviews GET Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    // Allow judge or organizer
    if (!session?.user || (userRole !== "judge" && userRole !== "organizer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dealId, teamId, scores, nomination, judgeNote } = await request.json();

    if (!dealId || !teamId || !scores) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    
    const activeEvent = await Event.findOne({ status: { $in: ["active", "paused"] } }).sort({ createdAt: -1 });
    if (!activeEvent) {
      return NextResponse.json({ error: "No active event found" }, { status: 404 });
    }

    const judgeId = (session.user as any).id;

    // Upsert review
    const review = await JudgeReview.findOneAndUpdate(
      { judgeId, dealId },
      {
        judgeId,
        dealId,
        teamId,
        eventId: activeEvent._id,
        designScore: scores.design,
        technicalScore: scores.technical,
        pitchScore: scores.pitch,
        innovationScore: scores.innovation,
        scalabilityScore: scores.scalability,
        nominatedAward: nomination !== "None" ? nomination : undefined,
        feedback: judgeNote || "",
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Judge Reviews POST Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
