import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EventSnapshot from "@/models/EventSnapshot";
import { auth } from "@/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !["admin", "organizer"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden — Admin / Organizer access required" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const result = await EventSnapshot.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Snapshot deleted successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
