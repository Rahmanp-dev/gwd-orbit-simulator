import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Deal from "@/models/Deal";
import Notification from "@/models/Notification";
import { awardPoints } from "@/lib/scoring";
import { auth } from "@/auth";

/**
 * POST /api/deals/:id/rating
 * Allows admin/organizer to submit a client satisfaction rating (1–5)
 * for a completed deal. Awards/deducts Orbit Score based on rating tier.
 * 
 * Business Plan Ref: §7 Engine 1 — Orbit Score scoring rules
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any)?.role ?? "participant";
    if (!["admin", "organizer"].includes(userRole)) {
      return NextResponse.json(
        { error: "Forbidden — only admin or organizer can submit client ratings" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { rating, feedback } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    const deal = await Deal.findById(id);
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    if (deal.clientRating) {
      return NextResponse.json(
        { error: "This deal already has a client rating" },
        { status: 409 }
      );
    }

    // Store rating on deal
    deal.clientRating = rating;
    deal.clientFeedback = feedback || "";
    await deal.save();

    // Calculate points based on business plan §7 Engine 1 table
    let pointsDelta = 0;
    let ratingLabel = "";
    if (rating === 5) {
      pointsDelta = 30;
      ratingLabel = "5/5 — Outstanding";
    } else if (rating === 4) {
      pointsDelta = 15;
      ratingLabel = "4/5 — Great";
    } else if (rating === 3) {
      pointsDelta = 0;
      ratingLabel = "3/5 — Average";
    } else {
      // rating 1 or 2
      pointsDelta = -10;
      ratingLabel = `${rating}/5 — Below expectations`;
    }

    const dealArchitectId = deal.dealArchitectId?.toString();
    const teamId = deal.teamId?.toString();
    const eventId = deal.eventId?.toString();

    if (dealArchitectId && teamId && eventId && pointsDelta !== 0) {
      await awardPoints({
        userId: dealArchitectId,
        teamId,
        eventId,
        action: "client_rating",
        points: pointsDelta,
        dealId: id,
        description: `Client rating for ${deal.clientBusiness}: ${ratingLabel}`,
      });
    }

    // Notify the deal architect
    if (dealArchitectId) {
      const emoji = rating === 5 ? "🌟" : rating === 4 ? "👍" : rating <= 2 ? "😔" : "📝";
      await Notification.create({
        userId: dealArchitectId,
        eventId: deal.eventId,
        type: rating >= 4 ? "deal_approved" : "deal_rejected",
        title: `Client Feedback: ${ratingLabel} ${emoji}`,
        message: `${deal.clientBusiness} rated their experience ${rating}/5. ${feedback ? `"${feedback}"` : ""} ${
          pointsDelta > 0 ? `+${pointsDelta} pts awarded!` : pointsDelta < 0 ? `${pointsDelta} pts penalty.` : ""
        }`,
        link: `/deals/${id}`,
      });
    }

    return NextResponse.json({
      message: "Rating submitted successfully",
      rating,
      pointsDelta,
      ratingLabel,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
