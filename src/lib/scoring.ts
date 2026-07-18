/**
 * BizSim Scoring Engine
 *
 * Defines all point values for actions in the simulation
 * and provides utilities for score calculation.
 */

import Score from "@/models/Score";
import User from "@/models/User";
import Team from "@/models/Team";
import mongoose from "mongoose";

export const SCORING_RULES: Record<string, number> = {
  // === Deal Lifecycle ===
  deal_submitted: 10,          // Interest signal queued for GWD Sales
  meaningful_conversation: 3,  // 2+ replies exchanged
  discovery_call: 8,           // 5+ minute call completed
  live_demo_shared: 10,        // Sent preview/demo link to lead
  proposal_sent: 15,           // Formal proposal sent
  meeting_booked: 20,          // In-person or video meeting scheduled
  deal_closed_verbal: 30,      // Verbal agreement received
  deal_closed_payment: 50,     // Payment received and verified
  retainer_signed: 25,         // Monthly retainer agreement signed

  // === Delivery ===
  project_delivered: 30,       // Deliverable marked complete
  client_approved: 40,         // Client signs off

  // === Speed Bonuses ===
  first_deal_day1: 100,        // First team to close on Day 1
  speed_close_24h: 20,         // Deal closed within 24h of first contact

  // === Quality (Judge-Awarded) ===
  quality_8_plus: 25,          // Judge scores quality 8+/10
  quality_10: 50,              // Perfect quality score from judge

  // === Penalties ===
  deal_rejected: -15,          // Deal evidence rejected by admin
  fabricated_evidence: -200,   // Fabricated evidence (+ disqualification)
  late_delivery: -10,          // Project delivered after deadline

  // === Wild Card ===
  wild_card_complete: 200,     // Completed Day 7 wild card challenge

  // === Team Bonuses ===
  all_members_scored: 50,      // Every team member scored individually today
  niche_leader_daily: 75,      // Highest revenue in niche for the day
  streak_3_days: 100,          // Team scored every day for 3 consecutive days
};

/** Deal value bonus: 0.5 points per ₹1,000 of deal value */
export function calculateDealValueBonus(dealValue: number): number {
  return Math.floor((dealValue / 1000) * 0.5);
}

/** Calculate total points for a deal based on its action type and value */
export function calculateDealPoints(
  actionType: string,
  dealValue: number = 0,
  bonuses: string[] = []
): { basePoints: number; valueBonus: number; bonusPoints: number; total: number } {
  const basePoints = SCORING_RULES[actionType] || 0;
  const valueBonus = actionType === "deal_closed_payment" ? calculateDealValueBonus(dealValue) : 0;
  const bonusPoints = bonuses.reduce((sum, b) => sum + (SCORING_RULES[b] || 0), 0);

  return {
    basePoints,
    valueBonus,
    bonusPoints,
    total: basePoints + valueBonus + bonusPoints,
  };
}

/** Determine tier based on orbit score */
export function getTierFromScore(score: number): "member" | "pro" | "elite" | "partner" {
  if (score >= 800) return "partner";
  if (score >= 600) return "elite";
  if (score >= 300) return "pro";
  return "member";
}

/** Tier display info */
export const TIER_INFO = {
  member:  { label: "Orbit Member",  color: "#6C757D", range: "0–299"  },
  pro:     { label: "Orbit Pro",     color: "#F4A01C", range: "300–599" },
  elite:   { label: "Orbit Elite",   color: "#E63946", range: "600–799" },
  partner: { label: "Orbit Partner", color: "#2E7D32", range: "800+"    },
} as const;

// ─── Shared Point Awarding Helper ─────────────────────────────────────────────

export interface AwardPointsOptions {
  userId: string | mongoose.Types.ObjectId;
  teamId: string | mongoose.Types.ObjectId;
  eventId: string | mongoose.Types.ObjectId;
  action: string;
  points: number;
  dealId?: string | mongoose.Types.ObjectId;
  description: string;
}

/** Apply 1.5x multiplier for new members (registered within last 30 days) */
export async function getPointsWithMultiplier(
  userId: string | mongoose.Types.ObjectId,
  basePoints: number
): Promise<{ points: number; isSprint: boolean }> {
  try {
    const user = await User.findById(userId).select("createdAt").lean();
    if (user && user.createdAt) {
      const daysActive = Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysActive <= 30) {
        return { points: Math.round(basePoints * 1.5), isSprint: true };
      }
    }
  } catch (err) {
    console.error("Multiplier calculation error:", err);
  }
  return { points: basePoints, isSprint: false };
}

/**
 * Award points to a user and their team atomically.
 * Creates a Score ledger entry, then increments both User.orbitScore
 * and Team.totalScore in parallel.
 * Automatically updates the user's tier after scoring.
 */
export async function awardPoints(opts: AwardPointsOptions): Promise<void> {
  const { userId, teamId, eventId, action, points, dealId, description } = opts;
  const { points: finalPoints, isSprint } = await getPointsWithMultiplier(userId, points);
  const finalDescription = isSprint ? `${description} (1.5x Onboarding Multiplier)` : description;

  // Run score ledger creation + user/team score updates in parallel
  const [, updatedUser] = await Promise.all([
    Score.create({
      userId,
      teamId,
      eventId,
      action,
      points: finalPoints,
      ...(dealId ? { dealId } : {}),
      description: finalDescription,
    }),
    User.findByIdAndUpdate(
      userId,
      { $inc: { orbitScore: finalPoints } },
      { new: true }
    ),
    Team.findByIdAndUpdate(teamId, { $inc: { totalScore: finalPoints } }),
  ]);

  // Update tier after scoring (non-blocking to the response)
  if (updatedUser) {
    const newTier = getTierFromScore(updatedUser.orbitScore);
    if (updatedUser.tier !== newTier) {
      await User.findByIdAndUpdate(userId, { tier: newTier });
    }
  }

  // Clear leaderboard cache dynamically
  try {
    const { clearLeaderboardCache } = await import("@/app/api/leaderboard/route");
    clearLeaderboardCache();
  } catch (e) {
    console.error("Failed to clear leaderboard cache:", e);
  }
}

/**
 * Award points that also increment team revenue + deal count
 * (used when a deal is officially closed and paid).
 */
export async function awardDealClosedPoints(opts: AwardPointsOptions & {
  dealValue: number;
}): Promise<void> {
  const { userId, teamId, eventId, action, points, dealId, description, dealValue } = opts;
  const { points: finalPoints, isSprint } = await getPointsWithMultiplier(userId, points);
  const finalDescription = isSprint ? `${description} (1.5x Onboarding Multiplier)` : description;

  const [, updatedUser] = await Promise.all([
    Score.create({
      userId,
      teamId,
      eventId,
      action,
      points: finalPoints,
      ...(dealId ? { dealId } : {}),
      description: finalDescription,
    }),
    User.findByIdAndUpdate(
      userId,
      { $inc: { orbitScore: finalPoints } },
      { new: true }
    ),
    Team.findByIdAndUpdate(teamId, {
      $inc: {
        totalScore: finalPoints,
        totalRevenue: dealValue,
        totalDeals: 1,
      },
    }),
  ]);

  if (updatedUser) {
    const newTier = getTierFromScore(updatedUser.orbitScore);
    if (updatedUser.tier !== newTier) {
      await User.findByIdAndUpdate(userId, { tier: newTier });
    }
  }

  // Clear leaderboard cache dynamically
  try {
    const { clearLeaderboardCache } = await import("@/app/api/leaderboard/route");
    clearLeaderboardCache();
  } catch (e) {
    console.error("Failed to clear leaderboard cache:", e);
  }
}
