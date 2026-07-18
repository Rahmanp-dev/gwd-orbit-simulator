import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import TeamMessage from "@/models/TeamMessage";
import User from "@/models/User";
import Team from "@/models/Team";
import mongoose from "mongoose";
import { sanitizeInput } from "@/lib/sanitizer";
import type { SenderRole } from "@/models/TeamMessage";

const STAFF_ROLES: SenderRole[] = ["admin", "organizer", "judge"];

/**
 * GET /api/team-messages — Fetch message history for a channel.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const channel = (searchParams.get("channel") || "team") as "team" | "broadcast" | "staff";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "200"), 500);

    const userRole = (session.user as any)?.role as SenderRole;
    const isStaff = STAFF_ROLES.includes(userRole);
    const sessionTeamId = (session.user as any)?.teamId;

    if (!isStaff && channel !== "team") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!isStaff && teamId && teamId !== String(sessionTeamId)) {
      return NextResponse.json({ error: "Forbidden — not your team" }, { status: 403 });
    }

    const filter: Record<string, unknown> = { channel };
    if (channel === "team") {
      let resolvedTeamId = isStaff ? teamId : sessionTeamId;
      if (!resolvedTeamId) {
        const defaultTeam = await Team.findOne().select("_id").lean();
        if (defaultTeam) {
          resolvedTeamId = (defaultTeam as any)._id.toString();
        }
      }
      if (resolvedTeamId) {
        // Support both string and ObjectId queries
        if (mongoose.Types.ObjectId.isValid(resolvedTeamId)) {
          filter.teamId = new mongoose.Types.ObjectId(resolvedTeamId);
        } else {
          filter.teamId = resolvedTeamId;
        }
      }
    }

    const rawMessages = await TeamMessage.find(filter).lean()
      .populate("userId", "name avatar participantRole role")
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    // Guarantee sender name & user details are never null/Unknown
    const messages = rawMessages.map((msg: any) => {
      if (!msg.userId || typeof msg.userId !== "object" || !msg.userId.name) {
        msg.userId = {
          name: msg.senderName || (msg.isStaffMessage ? "GWD Staff" : "Participant"),
          role: msg.senderRole || "participant",
          participantRole: "wildcard",
        };
      }
      return msg;
    });

    return NextResponse.json({ messages, channel });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/team-messages — Send a message to a channel.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let userId = (session.user as any)?.id as string;
    const userEmail = (session.user as any)?.email as string;
    const userName = (session.user as any)?.name || "GWD Staff";
    const userRole = (session.user as any)?.role as SenderRole;
    const sessionTeamId = (session.user as any)?.teamId;
    const isStaff = STAFF_ROLES.includes(userRole);

    // Ensure valid MongoDB User ObjectId
    const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;
    let validUser = OBJECT_ID_REGEX.test(userId)
      ? await User.findById(userId).select("_id name role").lean()
      : null;

    if (!validUser && userEmail) {
      validUser = await User.findOne({ email: userEmail }).select("_id name role").lean();
    }

    if (validUser) {
      userId = (validUser as any)._id.toString();
    } else {
      const newUser = await User.create({
        email: userEmail || `user_${Date.now()}@gwd.global`,
        name: userName,
        role: userRole || "participant",
        onboardingComplete: true,
      });
      userId = newUser._id.toString();
    }

    const body = await req.json();
    const { message: rawMsg, channel = "team", teamId } = body;
    const msgText = sanitizeInput(rawMsg);

    if (!msgText?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (msgText.trim().length > 500) {
      return NextResponse.json(
        { error: "Message is too long — maximum 500 characters allowed" },
        { status: 400 }
      );
    }

    if (!isStaff && channel !== "team") {
      return NextResponse.json({ error: "Participants can only post to team channel" }, { status: 403 });
    }
    if (userRole === "judge" && channel !== "staff") {
      return NextResponse.json({ error: "Judges can only post to the Staff Briefing channel" }, { status: 403 });
    }

    let resolvedTeamId: string | undefined;
    if (channel === "team") {
      resolvedTeamId = isStaff ? teamId : (sessionTeamId as string);
      if (!resolvedTeamId) {
        const defaultTeam = await Team.findOne().select("_id").lean();
        if (defaultTeam) {
          resolvedTeamId = (defaultTeam as any)._id.toString();
        } else {
          return NextResponse.json({ error: "No teams exist in database. Please seed teams." }, { status: 400 });
        }
      }
    }

    const teamIdObj = resolvedTeamId && mongoose.Types.ObjectId.isValid(resolvedTeamId)
      ? new mongoose.Types.ObjectId(resolvedTeamId)
      : undefined;

    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : undefined;

    const msg = await TeamMessage.create({
      channel,
      teamId: teamIdObj,
      userId: userIdObj,
      content: msgText.trim(),
      type: "text",
      senderName: userName,
      senderRole: userRole,
      isStaffMessage: isStaff,
    });

    let populated = await TeamMessage.findById(msg._id)
      .populate("userId", "name avatar participantRole role")
      .lean();

    if (populated && (!populated.userId || !(populated.userId as any).name)) {
      (populated as any).userId = {
        name: userName,
        role: userRole,
        participantRole: "wildcard",
      };
    }

    return NextResponse.json({ message: populated }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
