import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Deal from "@/models/Deal";
import User from "@/models/User";
import ClientContact from "@/models/ClientContact";
import { auth } from "@/auth";
import { awardPoints } from "@/lib/scoring";
import { maskDealForParticipant } from "@/lib/dealUtils";
import { sanitizeInput } from "@/lib/sanitizer";

/**
 * GET /api/deals — List deals with filters and role-based data masking.
 * Requires authentication. Participants are scoped to their own deals by default.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userRole = (session.user as any)?.role ?? "participant";
    const sessionUserId = (session.user as any)?.id;

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const eventId = searchParams.get("eventId");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 200);
    const skip = parseInt(searchParams.get("skip") ?? "0");

    const filter: Record<string, unknown> = {};
    if (teamId) filter.teamId = teamId;
    if (userId) filter.dealArchitectId = userId;
    if (status) filter.status = status;
    if (eventId) filter.eventId = eventId;

    // Participants are scoped to their own submitted deals by default
    if (userRole === "participant" && !teamId && !userId) {
      filter.dealArchitectId = sessionUserId;
    }

    const deals = await Deal.find(filter).lean()
      .populate("dealArchitectId", "name avatar participantRole")
      .populate("projectManagerId", "name avatar")
      .populate("teamId", "name emoji")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const maskedDeals = userRole === "participant"
      ? deals.map(maskDealForParticipant)
      : deals;

    return NextResponse.json({ deals: maskedDeals, total: deals.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/deals — Submit a new client interest signal (Stage 1 Handoff).
 * Requires authentication.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized — please log in first" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const {
      leadId, projectManagerId,
      clientName, clientBusiness, clientPhone, clientEmail,
      serviceType, dealValue, participantEstimatedValue, evidence, notes,
    } = body;

    if (!clientName || !clientBusiness || !serviceType) {
      return NextResponse.json(
        { error: "Missing required fields: clientName, clientBusiness, serviceType" },
        { status: 400 }
      );
    }

    // Resolve identity server-side — never trust client-sent eventId/teamId/dealArchitectId
    const userId = (session.user as any)?.id;
    let userTeamId = (session.user as any)?.teamId;
    let userEventId = (session.user as any)?.eventId;

    if (!userTeamId || !userEventId) {
      const dbUser = await User.findById(userId).select('teamId eventId');
      if (!userTeamId) userTeamId = dbUser?.teamId;
      if (!userEventId) userEventId = dbUser?.eventId;
    }

    if (!userEventId) {
      return NextResponse.json({ error: "No active event associated with your account." }, { status: 400 });
    }

    // Dynamic import to avoid circular dependencies if any, but since we are in a route handler, direct import is fine.
    const { Event } = await import("@/models");
    const event = await Event.findById(userEventId).select("status").lean();
    
    if (!event || (event as any).status !== "active") {
      return NextResponse.json(
        { error: `Cannot submit deals. The event is currently ${(event as any)?.status || "offline"}.` },
        { status: 403 }
      );
    }

    const dealArchitectId = userId;
    const teamId = userTeamId;
    const eventId = userEventId;

    const valueNum = Math.max(0, Number(dealValue || participantEstimatedValue || 0));

    // Prevent double-submissions for the same client business within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentDuplicate = await Deal.findOne({
      dealArchitectId,
      clientBusiness: sanitizeInput(clientBusiness),
      createdAt: { $gt: fiveMinutesAgo }
    });

    if (recentDuplicate) {
      return NextResponse.json(
        { error: "You recently submitted a deal for this business. Please check your deals list." },
        { status: 429 }
      );
    }

    const deal = await Deal.create({
      eventId, teamId,
      leadId: leadId || new mongoose.Types.ObjectId(),
      dealArchitectId, projectManagerId,
      clientName: sanitizeInput(clientName),
      clientBusiness: sanitizeInput(clientBusiness),
      clientPhone: clientPhone ? sanitizeInput(clientPhone) : undefined,
      clientEmail: clientEmail ? String(clientEmail).toLowerCase().trim() : undefined,
      serviceType: sanitizeInput(serviceType),
      dealValue: valueNum,
      participantEstimatedValue: valueNum,
      evidence: { ...(evidence || {}), notes: sanitizeInput(notes || evidence?.notes || "") },
      status: "admin_pending_contact",
      pointsAwarded: 0,
      bonusPoints: 0,
      deliveryStatus: "not_started",
    });

    // Create secure client vault record for GWD Admin access only
    try {
      await ClientContact.create({
        dealId: deal._id,
        businessName: String(clientBusiness).trim(),
        contactPerson: String(clientName).trim(),
        phone: clientPhone || "Not provided",
        email: clientEmail || "",
        interactions: [{
          date: new Date(),
          type: "meeting",
          handledBy: dealArchitectId,
          summary: `Initial interest signal submitted by participant. Pitched ${serviceType} (~Rs.${valueNum}). ${notes || ""}`,
          outcome: "Interest Signal Queued for GWD Sales Contact",
        }],
      });
    } catch (vaultError) {
      console.error("Failed to create ClientContact vault record:", vaultError);
    }

    // Award submission points using shared helper (runs Score + User + Team updates in parallel)
    await awardPoints({
      userId: dealArchitectId, teamId, eventId,
      action: "deal_submitted",
      points: 10,
      dealId: deal._id.toString(),
      description: `Submitted Client Interest Signal: ${clientBusiness} (${clientName}) - ${serviceType}`,
    });

    return NextResponse.json(
      { message: "Client Interest Signal submitted successfully to GWD Sales Queue", deal },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
