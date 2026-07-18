import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Score from "@/models/Score";

/**
 * GET /api/scores — Fetch score history for a user.
 * Query params: userId (optional, defaults to current user)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || (session.user as any)?.id;

    const scores = await Score.find({ userId }).lean()
      .populate("dealId", "clientName clientBusiness serviceType")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const total = scores.reduce((sum, s: any) => sum + s.points, 0);

    return NextResponse.json({ scores, total });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
