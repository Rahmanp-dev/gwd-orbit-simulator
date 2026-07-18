"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMe, useScores, useDeals } from "@/hooks/useData";
import { formatINR, formatINRCompact } from "@/lib/utils";
import {
  Trophy,
  DollarSign,
  Award,
  CheckCircle2,
  HelpCircle,
  PieChart,
  Zap,
} from "lucide-react";

const TIERS = [
  { name: "Member", min: 0, max: 299, color: "bg-gray-400", tierColor: "text-gray-600", bgColor: "bg-gray-50", desc: "Basic simulation access" },
  { name: "Pro", min: 300, max: 599, color: "bg-blue-500", tierColor: "text-blue-600", bgColor: "bg-blue-50", desc: "Eligible for standard freelance commissions" },
  { name: "Elite", min: 600, max: 799, color: "bg-purple-600", tierColor: "text-purple-600", bgColor: "bg-purple-50", desc: "Priority lead allocation & micro-agency leadership" },
  { name: "Partner", min: 800, max: 1000, color: "bg-[var(--crimson)]", tierColor: "text-[var(--crimson)]", bgColor: "bg-[var(--crimson-pale)]", desc: "Founding GWD Orbit contract & revenue share" },
];

function getTierInfo(score: number) {
  const tier = TIERS.find((t) => score >= t.min && score <= t.max) || TIERS[0];
  const nextTier = TIERS.find((t) => t.min > score);
  const pointsToNext = nextTier ? nextTier.min - score : 0;
  const rangeSize = tier.max - tier.min + 1;
  const progressPercent = Math.min(100, Math.round(((score - tier.min) / rangeSize) * 100));
  return { currentTier: tier, nextTier, pointsToNext, progressPercent };
}

export default function AnalyticsPage() {
  const { data: meData, isLoading: meLoading } = useMe();
  const { data: scoresData, isLoading: scoresLoading } = useScores();
  const { data: dealsData } = useDeals();

  const user = meData?.user;
  const scores = scoresData?.scores || [];
  const deals = dealsData?.deals || [];

  const orbitScore = user?.orbitScore ?? 0;
  const userName = user?.name || "Participant";
  const { currentTier, nextTier, pointsToNext, progressPercent } = getTierInfo(orbitScore);

  // Revenue from closed deals
  const closedRevenue = useMemo(() => {
    return deals
      .filter((d: any) => ["gwd_closed_paid", "client_approved"].includes(d.status))
      .reduce((sum: number, d: any) => sum + (d.gwdFinalDealValue || d.dealValue || 0), 0);
  }, [deals]);

  const approvedDeals = deals.filter((d: any) =>
    ["gwd_closed_paid", "client_approved", "delivery_qa_pass", "delivery_assigned"].includes(d.status)
  ).length;

  const totalDeals = deals.length;
  const approvalRate = totalDeals > 0 ? Math.round((approvedDeals / totalDeals) * 100) : 0;

  // Revenue Split simulator
  const [simDealValue, setSimDealValue] = useState<number>(50000);

  const isLoading = meLoading || scoresLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Personal Analytics" breadcrumbs={["Home", "Analytics"]}>
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-3xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Personal Analytics & Scoring Engine" breadcrumbs={["Home", "Analytics"]}>
      {/* Top Banner */}
      <div className="bg-[var(--dark)] text-white rounded-3xl p-8 mb-8 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[var(--crimson)]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-[var(--crimson)] rounded-full text-xs font-bold uppercase tracking-wider">
                Personal Score Engine
              </span>
              <Badge variant="warning" size="sm">Current Tier: {currentTier.name}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {userName} — Performance Telemetry
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
              Every verified deal, fast response, and 5-star client review boosts your orbit score. Hit 800+ points to guarantee your founding partner contract at GWD Orbit.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[220px] justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Your Orbit Score</div>
              <div className="text-3xl font-black text-[var(--crimson)] mt-0.5">{orbitScore} pts</div>
            </div>
            <div className="border-l border-white/10 pl-4">
              <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Tier</div>
              <div className="text-2xl font-bold text-green-400 mt-0.5">{currentTier.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value={formatINRCompact(closedRevenue)} label="Personal Closed Revenue" icon={DollarSign} />
        <StatCard value={`${orbitScore} pts`} label="Total Orbit Points" icon={Trophy} />
        <StatCard value={`${approvalRate}%`} label="Deal Success Rate" icon={CheckCircle2} />
        <StatCard value={nextTier ? nextTier.name : "MAX"} label="Next Tier Target" icon={Award} trend={nextTier ? "up" : undefined} trendValue={nextTier ? `${pointsToNext} pts remaining` : "Max tier reached!"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Tier Progression & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tier Progression Tracker */}
          <div className="card p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">
                  GWD Orbit Career Tier Roadmap
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  You are currently in <strong className={currentTier.tierColor}>{currentTier.name} Tier</strong>.
                  {nextTier && <> Earn {pointsToNext} more points to reach <strong className={nextTier.tierColor}>{nextTier.name} Tier</strong>.</>}
                </p>
              </div>
              <span className="text-xs font-black text-[var(--crimson)] bg-[var(--crimson-pale)] px-3 py-1 rounded-full">
                {progressPercent}% progress
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-[var(--surface-alt)] rounded-full overflow-hidden border border-[var(--border)] mb-6">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Tier Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {TIERS.map((tier) => {
                const isCurrent = tier.name === currentTier.name;
                return (
                  <div
                    key={tier.name}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? `border-blue-500 ${tier.bgColor} ring-2 ring-blue-500/20`
                        : "border-[var(--border)] bg-[var(--surface-alt)]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[var(--text-primary)]">{tier.name}</span>
                      <span className="text-[10px] font-extrabold text-[var(--text-muted)]">{tier.min}+ pts</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{tier.desc}</p>
                    {isCurrent && <Badge variant="default" size="sm" className="mt-2">Current Tier</Badge>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points History Log — REAL DATA */}
          <div className="card p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                Scoring Ledger ({scores.length} events)
              </h2>
              <span className="text-xs text-[var(--text-muted)] font-medium">Real-time server sync</span>
            </div>

            {scores.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-6 text-center">No score events yet. Submit your first deal!</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {scores.map((evt: any, i: number) => (
                  <div key={evt._id || i} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        evt.points > 0
                          ? "bg-[var(--success-pale)] text-[var(--success)]"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {evt.points > 0 ? "+" : ""}{evt.points}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">{evt.description}</div>
                        <div className="text-[11px] text-[var(--text-muted)] font-medium">
                          {new Date(evt.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-black ${evt.points > 0 ? "text-[var(--success)]" : "text-red-500"}`}>
                      {evt.points > 0 ? "+" : ""}{evt.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Revenue Split Calculator */}
        <div className="space-y-6">
          <div className="card p-6 border border-[var(--border)] shadow-sm bg-gradient-to-br from-white to-[var(--surface-alt)]">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-5 h-5 text-[var(--crimson)]" />
              <h3 className="font-bold text-base">
                GWD Orbit Revenue Split Simulator
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
              When you join GWD Orbit as a Founding Deal Architect or PM, every closed client project is automatically divided using our transparent profit-share formula.
            </p>

            {/* Interactive Slider */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-[var(--text-secondary)]">Simulated Project Deal Value:</span>
                <span className="text-base font-black text-[var(--crimson)]">{formatINR(simDealValue)}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={simDealValue}
                onChange={(e) => setSimDealValue(Number(e.target.value))}
                className="w-full accent-[var(--crimson)] cursor-pointer h-2 bg-[var(--border-strong)] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-semibold">
                <span>₹10,000</span>
                <span>₹1,00,000</span>
                <span>₹2,00,000</span>
              </div>
            </div>

            {/* Split Breakdown Table */}
            <div className="space-y-3 pt-4 border-t border-[var(--border)] text-xs">
              {[
                { label: "GWD Platform Fee (20%)", percent: 0.20, color: "text-gray-700 bg-gray-100" },
                { label: "Deal Architect Commission (15%)", percent: 0.15, color: "text-[var(--crimson)] bg-[var(--crimson-pale)] font-bold" },
                { label: "Project Manager Commission (10%)", percent: 0.10, color: "text-blue-700 bg-blue-50 font-bold" },
                { label: "Developer Squad Share (45%)", percent: 0.45, color: "text-purple-700 bg-purple-50 font-bold" },
                { label: "Team Reserve & Bonus Pool (10%)", percent: 0.10, color: "text-green-700 bg-green-50" },
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-xl flex items-center justify-between ${item.color}`}>
                  <span>{item.label}</span>
                  <span className="text-sm font-black">{formatINR(simDealValue * item.percent)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Help box */}
          <div className="card p-5 border border-[var(--border)] shadow-sm">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[var(--crimson)]" /> How are points calculated?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Base deal approvals grant <strong>50 points</strong> immediately. Additionally, you earn <strong>0.5 points for every ₹1,000</strong> of verified deal value. Speed closing within 24 hours unlocks a <strong>+20 pt speed multiplier</strong>.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
