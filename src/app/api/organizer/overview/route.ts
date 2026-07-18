import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Deal from "@/models/Deal";
import Team from "@/models/Team";
import User from "@/models/User";
import Event from "@/models/Event";
import Score from "@/models/Score";
import Niche from "@/models/Niche";

/**
 * GET /api/organizer/overview — Full event-wide telemetry for CEO/Organizer.
 * Requires organizer role.
 */
export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || userRole !== "organizer") {
      return NextResponse.json({ error: "Forbidden — organizer role required" }, { status: 403 });
    }

    await dbConnect();

    const event = await Event.findOne({ status: { $in: ["active", "paused", "completed"] } })
      .sort({ createdAt: -1 })
      .lean();

    if (!event) {
      return NextResponse.json({ error: "No event found" }, { status: 404 });
    }

    const eventFilter = { eventId: event._id };

    const [
      totalParticipants,
      totalTeams,
      totalDeals,
      rankedTeams,
      nicheBreakdown,
      topClosers,
      revenueByDay,
      dealPipeline,
      recentScores,
    ] = await Promise.all([
      User.countDocuments({ role: "participant", ...eventFilter }),
      Team.countDocuments(eventFilter),
      Deal.countDocuments(eventFilter),
      Team.find(eventFilter).lean()
        .select("name emoji totalScore totalRevenue totalDeals nicheId memberIds")
        .populate("nicheId", "name icon color")
        .populate("memberIds", "name avatar participantRole orbitScore tier")
        .sort({ totalScore: -1 })
        .lean(),
      Niche.aggregate([
        { $match: { eventId: event._id } },
        {
          $lookup: {
            from: "deals",
            let: { nicheId: "$_id" },
            pipeline: [
              { $lookup: { from: "teams", localField: "teamId", foreignField: "_id", as: "team" } },
              { $unwind: "$team" },
              { $match: { $expr: { $eq: ["$team.nicheId", "$$nicheId"] } } },
              { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$gwdFinalDealValue" } } },
            ],
            as: "dealStats",
          },
        },
        {
          $project: {
            name: 1, icon: 1, color: 1,
            deals: { $ifNull: [{ $arrayElemAt: ["$dealStats.count", 0] }, 0] },
            revenue: { $ifNull: [{ $arrayElemAt: ["$dealStats.revenue", 0] }, 0] },
          },
        },
      ]),
      User.find({ role: "participant", ...eventFilter }).lean()
        .select("name avatar participantRole orbitScore tier teamId")
        .populate("teamId", "name emoji")
        .sort({ orbitScore: -1 })
        .limit(10)
        .lean(),
      Deal.aggregate([
        { $match: { ...eventFilter, status: { $in: ["gwd_closed_paid", "client_approved"] } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$gwdFinalDealValue" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Deal.aggregate([
        { $match: eventFilter },
        { $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$dealValue" } } },
        { $sort: { count: -1 } },
      ]),
      Score.find(eventFilter).lean()
        .populate("userId", "name avatar")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    const totalRevenue = rankedTeams.reduce((sum: number, t: any) => sum + (t.totalRevenue || 0), 0);

    return NextResponse.json({
      event,
      stats: { totalParticipants, totalTeams, totalDeals, totalRevenue },
      rankedTeams,
      nicheBreakdown,
      topClosers,
      revenueByDay,
      dealPipeline,
      recentActivity: recentScores,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
