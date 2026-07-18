import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";

/**
 * GET /api/notifications — Fetch notifications for the current user.
 * PATCH /api/notifications — Mark notifications as read.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userId = (session.user as any)?.id;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userId = (session.user as any)?.id;
    const body = await req.json();
    const { action, notificationId } = body;

    if (action === "mark_read" && notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true }
      );
      return NextResponse.json({ message: "Marked as read" });
    }

    if (action === "mark_all_read") {
      await Notification.updateMany({ userId, read: false }, { read: true });
      return NextResponse.json({ message: "All marked as read" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
