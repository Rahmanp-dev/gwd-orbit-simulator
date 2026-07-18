import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { seedAll } from "@/lib/seed-data";
import Event from "@/models/Event";
import { auth } from "@/auth";

/**
 * POST /api/seed — Seeds the database with comprehensive demo data.
 * 
 * Idempotent: if data already exists, wipes and re-seeds.
 * Requires admin or organizer role to restrict access.
 */
export async function POST() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!["admin", "organizer"].includes(userRole)) {
      return NextResponse.json(
        { error: "Forbidden — admin or organizer role required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const result = await seedAll();

    // Clear leaderboard cache dynamically
    try {
      const { clearLeaderboardCache } = await import("@/app/api/leaderboard/route");
      clearLeaderboardCache();
    } catch (e) {
      console.error("Failed to clear leaderboard cache during seed:", e);
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Seed failed";
    console.error("[GWD Seed] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
