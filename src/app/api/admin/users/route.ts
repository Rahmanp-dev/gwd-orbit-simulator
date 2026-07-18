import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

/**
 * GET /api/admin/users — List all users with team/niche info, support search, filters, pagination.
 * Requires admin or organizer role.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !["admin", "organizer"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const teamId = searchParams.get("teamId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const query: Record<string, any> = {};

    if (role && role !== "all") {
      query.role = role;
    }
    if (teamId && teamId !== "all") {
      query.teamId = teamId;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("name email role participantRole orbitScore tier teamId nicheId eventId avatar phone suspended onboardingComplete createdAt")
        .populate("teamId", "name emoji")
        .populate("nicheId", "name icon color")
        .sort({ orbitScore: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
