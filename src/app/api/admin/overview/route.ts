import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Deal from "@/models/Deal";
import Team from "@/models/Team";
import User from "@/models/User";
import Event from "@/models/Event";
import Score from "@/models/Score";

/**
 * GET /api/admin/overview — Aggregated admin dashboard data.
 * Requires admin or organizer role.
 */
export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !["admin", "organizer"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const event = await Event.findOne({ status: { $in: ["active", "paused", "registration", "completed"] } })
      .sort({ createdAt: -1 })
      .lean();

    const eventFilter = event ? { eventId: event._id } : {};

    // Run all queries in parallel
    const [
      totalParticipants,
      totalTeams,
      totalDeals,
      pendingDeals,
      closedDeals,
      dealsByStatus,
      topTeams,
      recentScores,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "participant", ...eventFilter }),
      Team.countDocuments(eventFilter),
      Deal.countDocuments(eventFilter),
      Deal.countDocuments({ status: "admin_pending_contact", ...eventFilter }),
      Deal.countDocuments({ status: { $in: ["gwd_closed_paid", "client_approved"] }, ...eventFilter }),
      Deal.aggregate([
        { $match: eventFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Team.find(eventFilter).lean()
        .select("name emoji totalScore totalRevenue totalDeals nicheId")
        .populate("nicheId", "name icon color")
        .sort({ totalScore: -1 })
        .limit(10)
        .lean(),
      Score.find(eventFilter).lean()
        .populate("userId", "name avatar participantRole")
        .populate("dealId", "clientBusiness")
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
      Deal.aggregate([
        { $match: { ...eventFilter, status: { $in: ["gwd_closed_paid", "client_approved"] } } },
        { $group: { _id: null, total: { $sum: "$gwdFinalDealValue" } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    return NextResponse.json({
      event: event || null,
      stats: {
        totalParticipants,
        totalTeams,
        totalDeals,
        pendingDeals,
        closedDeals,
        totalRevenue,
      },
      dealsByStatus: Object.fromEntries(dealsByStatus.map((d: any) => [d._id, d.count])),
      topTeams,
      recentActivity: recentScores,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
