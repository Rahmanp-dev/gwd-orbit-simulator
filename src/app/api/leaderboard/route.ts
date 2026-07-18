import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import User from "@/models/User";

// ─── LEADERBOARD MEMORY CACHE ─────────────────────────────────────────────────
// Since SWR polls every 15s, memory cache prevents DB query overhead.
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 3000; // Cache for 3 seconds to throttle concurrent SWR requests

export function clearLeaderboardCache() {
  for (const key in cache) {
    delete cache[key];
  }
}

/**
 * GET /api/leaderboard — Get ranked teams and individuals (public)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId") || "all";
    const type = searchParams.get("type") || "team"; // "team" or "individual"
    const cacheKey = `${type}_${eventId}`;

    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
      return NextResponse.json(cache[cacheKey].data);
    }

    await dbConnect();

    if (type === "team") {
      const queryFilter = eventId && eventId !== "all" ? { eventId } : {};
      const teams = await Team.find(queryFilter).lean()
        .select("name emoji rank totalScore totalRevenue totalDeals captainId memberIds nicheId eventId")
        .populate("memberIds", "name avatar participantRole orbitScore tier")
        .populate("captainId", "name avatar")
        .populate("nicheId", "name icon color")
        .sort({ totalScore: -1, totalRevenue: -1, totalDeals: -1 })
        .lean();

      const rankedTeams = teams.map((team, index) => ({
        ...team,
        rank: index + 1,
      }));

      const resData = { leaderboard: rankedTeams, type: "team" };
      cache[cacheKey] = { data: resData, timestamp: now };
      return NextResponse.json(resData);
    } else {
      const queryFilter = eventId && eventId !== "all" ? { eventId } : {};
      const participants = await User.find({
        role: "participant",
        ...queryFilter,
      }).lean()
        .select("name avatar participantRole orbitScore tier teamId")
        .populate("teamId", "name emoji")
        .sort({ orbitScore: -1 })
        .limit(50)
        .lean();

      const rankedParticipants = participants.map((p, index) => ({
        ...p,
        rank: index + 1,
      }));

      const resData = { leaderboard: rankedParticipants, type: "individual" };
      cache[cacheKey] = { data: resData, timestamp: now };
      return NextResponse.json(resData);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
