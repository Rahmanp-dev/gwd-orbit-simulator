import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Team from "@/models/Team";
import Deal from "@/models/Deal";
import Score from "@/models/Score";
import Event from "@/models/Event";
import { auth } from "@/auth";
import { awardPoints } from "@/lib/scoring";
import mongoose from "mongoose";

// GET /api/admin/users/[id] — Retrieve detailed info of a specific user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !["admin", "organizer"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const user = await User.findById(id)
      .populate("teamId", "name emoji")
      .populate("nicheId", "name icon color")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's deals and scores
    const [deals, scores] = await Promise.all([
      Deal.find({ dealArchitectId: id }).sort({ createdAt: -1 }).lean(),
      Score.find({ userId: id }).sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({ user, deals, scores });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] — Admin edit user profile, role, team, suspension status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const adminId = (session?.user as any)?.id;
    if (!session?.user || !["admin", "organizer"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Define editable fields
    const allowedFields = ["name", "phone", "email", "role", "participantRole", "teamId", "suspended"];
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validations
    if (updateData.role && !["participant", "admin", "judge", "organizer"].includes(updateData.role)) {
      return NextResponse.json({ error: "Invalid role value" }, { status: 400 });
    }

    if (
      updateData.participantRole &&
      !["deal_architect", "project_manager", "developer", "designer", "wildcard"].includes(updateData.participantRole)
    ) {
      return NextResponse.json({ error: "Invalid participantRole value" }, { status: 400 });
    }

    // Suspension tracking
    if (updateData.suspended !== undefined && updateData.suspended !== user.suspended) {
      if (updateData.suspended) {
        updateData.suspendedAt = new Date();
        updateData.suspendedBy = adminId;
      } else {
        updateData.suspendedAt = null;
        updateData.suspendedBy = null;
      }
    }

    // Team reassignment check
    if (updateData.teamId !== undefined && String(updateData.teamId) !== String(user.teamId)) {
      const oldTeamId = user.teamId;
      const newTeamId = updateData.teamId;

      // Handle old team cleanup
      if (oldTeamId) {
        await Team.findByIdAndUpdate(oldTeamId, { $pull: { memberIds: user._id } });
      }

      // Handle new team insertion
      if (newTeamId && mongoose.Types.ObjectId.isValid(newTeamId)) {
        const newTeam = await Team.findById(newTeamId);
        if (!newTeam) {
          return NextResponse.json({ error: "Target team not found" }, { status: 404 });
        }
        await Team.findByIdAndUpdate(newTeamId, { $addToSet: { memberIds: user._id } });
        // Set nicheId of the user to match the team's nicheId
        updateData.nicheId = newTeam.nicheId;
      } else {
        updateData.teamId = null;
        updateData.nicheId = null;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("teamId", "name emoji")
      .populate("nicheId", "name icon color")
      .lean();

    // Clear leaderboard cache in case team or score status changed
    try {
      const { clearLeaderboardCache } = await import("@/app/api/leaderboard/route");
      clearLeaderboardCache();
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/users/[id] — Award / deduct points from a user (manual score adjustment)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !["admin", "organizer"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { points, reason } = body;

    const pointsNum = Number(points);
    if (isNaN(pointsNum) || pointsNum === 0) {
      return NextResponse.json({ error: "Points must be a non-zero number" }, { status: 400 });
    }

    if (!reason?.trim()) {
      return NextResponse.json({ error: "Adjustment reason is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine eventId and teamId context
    const eventId = user.eventId || (await Event.findOne({ status: { $in: ["active", "paused", "registration", "completed"] } }).select("_id").lean())?._id;
    if (!eventId) {
      return NextResponse.json({ error: "No active event found to log scores" }, { status: 404 });
    }

    // A teamId is required by the scoring ledger
    let teamId = user.teamId;
    if (!teamId) {
      // Find the first team in this event as a fallback, or return error if none exists
      const fallbackTeam = await Team.findOne({ eventId }).select("_id").lean();
      if (!fallbackTeam) {
        return NextResponse.json({ error: "User is not assigned to a team, and no event teams exist to log the transaction" }, { status: 400 });
      }
      teamId = fallbackTeam._id as mongoose.Types.ObjectId;
    }

    await awardPoints({
      userId: user._id as mongoose.Types.ObjectId,
      teamId: teamId as mongoose.Types.ObjectId,
      eventId: eventId as mongoose.Types.ObjectId,
      action: "admin_adjustment",
      points: pointsNum,
      description: `Admin manual adjustment: ${reason.trim()}`,
    });

    const updatedUser = await User.findById(id)
      .select("name orbitScore tier")
      .lean();

    return NextResponse.json({
      success: true,
      message: `Successfully adjusted score by ${pointsNum > 0 ? "+" : ""}${pointsNum} points`,
      orbitScore: updatedUser?.orbitScore,
      tier: updatedUser?.tier,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
