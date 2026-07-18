import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Deal from "@/models/Deal";
import Notification from "@/models/Notification";
import ClientContact from "@/models/ClientContact";
import { calculateDealValueBonus, awardPoints, awardDealClosedPoints } from "@/lib/scoring";
import { maskDealForParticipant } from "@/lib/dealUtils";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const { id } = await params;
    const userRole = (session.user as any)?.role ?? "participant";

    const deal = await Deal.findById(id)
      .populate("dealArchitectId", "name avatar participantRole orbitScore")
      .populate("projectManagerId", "name avatar")
      .populate("teamId", "name emoji rank")
      .populate("verifiedByAdminId", "name")
      .populate("deliveryAssignedTo", "name avatar role")
      .lean();

    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    const result = userRole === "participant"
      ? maskDealForParticipant(deal as Record<string, unknown>)
      : deal;

    return NextResponse.json({ deal: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any)?.role ?? "participant";
    const sessionUserId = (session.user as any)?.id;

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const {
      action, rejectionReason, finalValue,
      paymentMethod, transactionId, invoiceNumber, internalNotes,
      deliveryAssignment, deliveryAssignedTo, deliveryBriefUrl, qaFeedback,
    } = body;

    const adminOnlyActions = [
      "handoff_contact", "gwd_contacted", "proposal_sent", "negotiating",
      "gwd_close_paid", "approve", "cold_lead", "reject",
      "assign_delivery", "delivery_qa_pass", "client_approved",
    ];
    if (adminOnlyActions.includes(action) && userRole === "participant") {
      return NextResponse.json({ error: "Forbidden - admin role required" }, { status: 403 });
    }

    const deal = await Deal.findById(id);
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    if (internalNotes !== undefined) deal.gwdInternalNotes = internalNotes;

    if (action === "handoff_contact" || action === "gwd_contacted") {
      deal.status = "gwd_contacted";
      deal.gwdContactedAt = new Date();
      deal.verifiedByAdminId = sessionUserId;
      await Promise.all([
        deal.save(),
        ClientContact.findOneAndUpdate({ dealId: deal._id }, {
          $push: { interactions: { date: new Date(), type: "call", handledBy: sessionUserId, summary: "GWD Sales officially initiated contact with client following participant interest signal.", outcome: "Contact Established" } },
        }),
        Notification.create({ userId: deal.dealArchitectId, eventId: deal.eventId, type: "deal_approved", title: "GWD Sales Contacted Client!", message: `Our sales team has officially contacted ${deal.clientName} (${deal.clientBusiness}). We are moving toward a proposal!`, link: `/deals/${deal._id}` }),
      ]);
    }
    else if (action === "proposal_sent" || action === "negotiating") {
      deal.status = action;
      if (action === "proposal_sent") deal.gwdProposalSentAt = new Date();
      await deal.save();
    }
    else if (action === "gwd_close_paid" || action === "approve") {
      const closedValue = Number(finalValue || deal.gwdFinalDealValue || deal.dealValue || 0);
      deal.gwdFinalDealValue = closedValue;
      deal.dealValue = closedValue;
      deal.status = "gwd_closed_paid";
      deal.verifiedByAdminId = sessionUserId;
      deal.gwdPaymentConfirmedAt = new Date();
      if (paymentMethod) deal.gwdPaymentMethod = paymentMethod;
      if (transactionId) deal.gwdPaymentTransactionId = transactionId;
      if (invoiceNumber) deal.gwdInvoiceNumber = invoiceNumber;
      const totalPoints = 50 + calculateDealValueBonus(closedValue);
      deal.pointsAwarded = totalPoints;
      await Promise.all([
        deal.save(),
        ClientContact.findOneAndUpdate({ dealId: deal._id }, { $push: { interactions: { date: new Date(), type: "meeting", handledBy: sessionUserId, summary: `Official GWD contract signed. Payment of Rs.${closedValue} confirmed via ${paymentMethod || "Razorpay"}. Txn: ${transactionId || "N/A"}.`, outcome: "Contract Signed & Paid" } } }),
        awardDealClosedPoints({ userId: deal.dealArchitectId.toString(), teamId: deal.teamId.toString(), eventId: deal.eventId.toString(), action: "deal_closed_payment", points: totalPoints, dealId: deal._id.toString(), description: `GWD closed & paid: ${deal.clientBusiness} - Rs.${closedValue}`, dealValue: closedValue }),
        Notification.create({ userId: deal.dealArchitectId, eventId: deal.eventId, type: "deal_approved", title: "Deal Closed & Paid to GWD!", message: `Your deal for ${deal.clientBusiness} (Rs.${closedValue}) has been closed! You earned +${totalPoints} points!`, link: `/deals/${deal._id}` }),
      ]);
    }
    else if (action === "cold_lead" || action === "reject") {
      deal.status = action === "cold_lead" ? "lead_cold" : "rejected";
      deal.verifiedByAdminId = sessionUserId;
      deal.verifiedAt = new Date();
      deal.rejectionReason = rejectionReason || "Client lead unresponsive or unqualified.";
      await Promise.all([
        deal.save(),
        awardPoints({ userId: deal.dealArchitectId.toString(), teamId: deal.teamId.toString(), eventId: deal.eventId.toString(), action: "deal_rejected", points: -15, dealId: deal._id.toString(), description: `Lead cold/rejected: ${deal.clientBusiness}` }),
        Notification.create({ userId: deal.dealArchitectId, eventId: deal.eventId, type: "deal_rejected", title: "Lead Marked Cold", message: `Your interest signal for ${deal.clientBusiness} could not be closed. Reason: ${deal.rejectionReason}`, link: `/deals/${deal._id}` }),
      ]);
    }
    else if (action === "assign_delivery") {
      deal.deliveryAssignment = deliveryAssignment || "participant_supervised";
      if (deliveryAssignedTo) deal.deliveryAssignedTo = deliveryAssignedTo;
      if (deliveryBriefUrl) deal.deliveryBriefUrl = deliveryBriefUrl;
      deal.status = "delivery_assigned";
      deal.deliveryStatus = "in_progress";
      const notifyP = deliveryAssignment !== "gwd_full"
        ? Notification.create({ userId: deal.dealArchitectId, eventId: deal.eventId, type: "system", title: "Delivery Assigned!", message: `GWD has assigned delivery for ${deal.clientBusiness} to your team.`, link: `/deals/${deal._id}` })
        : Promise.resolve();
      await Promise.all([deal.save(), notifyP]);
    }
    else if (action === "delivery_qa_pass") {
      deal.status = "delivery_qa_pass";
      if (!deal.deliveryQA) deal.deliveryQA = {};
      deal.deliveryQA.adminQaStatus = "approved";
      if (qaFeedback) deal.deliveryQA.adminQaFeedback = qaFeedback;
      deal.bonusPoints = (deal.bonusPoints || 0) + 20;
      await Promise.all([
        deal.save(),
        awardPoints({ userId: deal.dealArchitectId.toString(), teamId: deal.teamId.toString(), eventId: deal.eventId.toString(), action: "project_delivered", points: 20, dealId: deal._id.toString(), description: `Passed GWD Pre-Delivery QA: ${deal.clientBusiness}` }),
        Notification.create({ userId: deal.dealArchitectId, eventId: deal.eventId, type: "deal_approved", title: "QA Passed! (+20 pts)", message: `Deliverables for ${deal.clientBusiness} passed GWD QA!`, link: `/deals/${deal._id}` }),
      ]);
    }
    else if (action === "client_approved") {
      deal.status = "client_approved";
      deal.deliveryStatus = "client_approved";
      deal.bonusPoints = (deal.bonusPoints || 0) + 40;
      await Promise.all([
        deal.save(),
        awardPoints({ userId: deal.dealArchitectId.toString(), teamId: deal.teamId.toString(), eventId: deal.eventId.toString(), action: "client_approved", points: 40, dealId: deal._id.toString(), description: `Client 5-Star Sign-off: ${deal.clientBusiness}` }),
        Notification.create({ userId: deal.dealArchitectId, eventId: deal.eventId, type: "deal_approved", title: "Client 5-Star Sign-Off! (+40 pts)", message: `${deal.clientBusiness} signed off with 5-star feedback!`, link: `/deals/${deal._id}` }),
      ]);
    }

    return NextResponse.json({ message: `Deal updated (${action})`, deal });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}