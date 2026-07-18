import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/auth";

// ─── GET: Current user profile ──────────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as any).id;
    const user = await User.findById(userId)
      .select("name email phone role participantRole teamId nicheId orbitScore tier bio linkedin upiId notificationPrefs avatar")
      .populate("teamId", "name emoji")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PATCH: Update user profile ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Whitelist allowed fields — role, teamId, orbitScore, etc. are NOT user-editable
    const allowedFields = ["name", "phone", "bio", "linkedin", "portfolio", "upiId", "notificationPrefs"];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validate name (non-empty string)
    if (updateData.name !== undefined && (typeof updateData.name !== "string" || !(updateData.name as string).trim())) {
      return NextResponse.json({ error: "Name must be a non-empty string" }, { status: 400 });
    }

    // Validate UPI ID format (basic)
    if (updateData.upiId !== undefined) {
      const upiRegex = /^[\w.\-]+@[\w]+$/;
      if (!upiRegex.test(String(updateData.upiId))) {
        return NextResponse.json({ error: "Invalid UPI ID format (e.g. name@okaxis)" }, { status: 400 });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await dbConnect();

    const userId = (session.user as any).id;
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .select("name email phone role participantRole teamId nicheId orbitScore tier bio linkedin upiId notificationPrefs")
      .populate("teamId", "name emoji")
      .lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updated, message: "Profile updated successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
