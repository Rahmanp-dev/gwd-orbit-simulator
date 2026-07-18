"use client";

import { useMemo, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { useDeals, useEvent, useScores, useMe } from "@/hooks/useData";
import { formatINR, formatINRCompact } from "@/lib/utils";
import { DEAL_STATUS_META } from "@/lib/dealUtils";
import {
  Zap,
  Target,
  DollarSign,
  Trophy,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Users,
  BarChart3,
  AlertCircle,
  Inbox,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const TIER_INFO: Record<string, { label: string; range: string; color: string }> = {
  member:  { label: "Member",  range: "0–299",  color: "#6C757D" },
  pro:     { label: "Pro",     range: "300–599", color: "#F4A01C" },
  elite:   { label: "Elite",   range: "600–799", color: "#E63946" },
  partner: { label: "Partner", range: "800+",    color: "#2E7D32" },
};

function ptsToNextTier(score: number): { next: string; gap: number } | null {
  if (score < 300) return { next: "Pro", gap: 300 - score };
  if (score < 600) return { next: "Elite", gap: 600 - score };
  if (score < 800) return { next: "Partner", gap: 800 - score };
  return null;
}

export default function DashboardPage() {
  const { name } = useUserRole();
  const { data: session, update: updateSession } = useSession();
  const { data: meData } = useMe();
  const { data: dealsData, isLoading: dealsLoading } = useDeals();
  const { data: eventData } = useEvent();
  const { data: scoresData } = useScores();

  const hasHealedRef = useRef(false);
  // Heal stale demo session IDs on first page load
  useEffect(() => {
    const id = (session?.user as any)?.id as string | undefined;
    if (id && !/^[a-f0-9]{24}$/i.test(id) && !hasHealedRef.current) {
      hasHealedRef.current = true;
      updateSession();
    }
  }, [session, updateSession]);

  const user = meData?.user;
  const deals = dealsData?.deals || [];
  const event = eventData?.event;
  const scores = scoresData?.scores || [];

  const orbitScore = user?.orbitScore ?? 0;
  const tier = user?.tier ?? "member";
  const tierMeta = TIER_INFO[tier] || TIER_INFO.member;
  const nextTier = ptsToNextTier(orbitScore);
  const currentDay = event?.currentDay ?? 1;
  const totalDays = event?.totalDays ?? 9;

  // Compute stats from real deals
  const stats = useMemo(() => {
    const closedDeals = deals.filter((d: any) =>
      ["gwd_closed_paid", "client_approved", "delivery_qa_pass", "delivery_in_progress", "delivery_assigned"].includes(d.status)
    );
    const revenue = closedDeals.reduce((sum: number, d: any) => sum + (d.gwdFinalDealValue || d.dealValue || 0), 0);
    const pending = deals.filter((d: any) =>
      ["admin_pending_contact", "submitted", "gwd_contacted", "proposal_sent", "negotiating"].includes(d.status)
    );
    return {
      totalDeals: deals.length,
      closedDeals: closedDeals.length,
      revenue,
      pendingDeals: pending.length,
    };
  }, [deals]);

  const simulatedEarnings = useMemo(() => {
    const closedDeals = deals.filter((d: any) => d.status === 'gwd_closed_paid');
    const role = user?.participantRole;
    const commissionRate = role === 'deal_architect' ? 0.15 : role === 'project_manager' ? 0.10 : 0.45;
    return closedDeals.reduce((sum: number, d: any) => sum + (d.gwdFinalDealValue || d.dealValue || 0) * commissionRate, 0);
  }, [deals, user]);

  // Recent activity from score ledger
  const recentActivity = useMemo(() => {
    return scores.slice(0, 5).map((s: any) => {
      const isPositive = s.points > 0;
      return {
        text: `${s.description} (${isPositive ? "+" : ""}${s.points} pts)`,
        time: new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        type: isPositive ? "success" : "danger",
      };
    });
  }, [scores]);

  // Dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const isNewMemberSprint = useMemo(() => {
    if (!user?.createdAt) return false;
    const daysActive = Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysActive <= 30;
  }, [user?.createdAt]);

  const firstName = name.split(" ")[0] || name;

  return (
    <DashboardLayout title="Dashboard" breadcrumbs={["Home", "Dashboard"]}>
      {/* ═══ GREETING ═══ */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 flex-wrap">
            {greeting}, <span className="text-[var(--crimson)]">{firstName}</span> 👋
            {isNewMemberSprint && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/60 border border-emerald-500/20 rounded-full shadow-2xs">
                🚀 1.5x Sprint Active
              </span>
            )}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Day {currentDay} of {totalDays} — Keep pushing. Every conversation counts.
          </p>
        </div>
      </div>

      {user && !user.onboardingComplete && (
        <div className="card p-5 border border-[var(--crimson)]/30 bg-[var(--crimson)]/5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[var(--crimson)]" />
            <h3 className="font-bold text-base">Complete Your Setup</h3>
            <span className="ml-auto text-xs font-mono text-[var(--crimson)] font-bold">
              {Math.round(((user.onboardingStep || 1) / 5) * 100)}% Done
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 rounded-full bg-[var(--surface-alt)] mb-4 overflow-hidden">
            <div
              className="h-2 rounded-full bg-[var(--crimson)] transition-all duration-500"
              style={{ width: `${((user.onboardingStep || 1) / 5) * 100}%` }}
            />
          </div>
          {/* Checklist */}
          {[
            { step: 1, label: 'Account created', href: null },
            { step: 2, label: 'Complete your profile (phone + UPI ID)', href: '/settings' },
            { step: 3, label: 'Claim your first lead', href: '/niche' },
            { step: 4, label: 'Submit your first deal signal', href: '/deals/new' },
            { step: 5, label: 'You are fully set up!', href: null },
          ].map(({ step, label, href }) => {
            const done = (user.onboardingStep || 1) >= step;
            return (
              <div key={step} className={`flex items-center gap-2.5 py-1.5 text-sm ${done ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)] font-medium'}`}>
                {done
                  ? <CheckCircle2 className="w-4 h-4 text-[var(--success)] flex-shrink-0" />
                  : <div className="w-4 h-4 rounded-full border-2 border-[var(--border)] flex-shrink-0" />}
                <span className={done ? 'line-through' : ''}>{label}</span>
                {!done && href && (
                  <Link href={href} className="ml-auto text-[11px] text-[var(--crimson)] font-bold hover:underline">Go →</Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ STATS GRID ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          value={orbitScore.toString()}
          label="Orbit Score"
          icon={Zap}
          trend={orbitScore > 0 ? "up" : undefined}
          trendValue={nextTier ? `${nextTier.gap} to ${nextTier.next}` : "Max tier!"}
        />
        <StatCard
          value={stats.totalDeals.toString()}
          label="Total Deals"
          icon={Target}
        />
        <StatCard
          value={formatINRCompact(stats.revenue)}
          label="Revenue Closed"
          icon={DollarSign}
        />
        <StatCard
          value={stats.pendingDeals.toString()}
          label="In Pipeline"
          icon={Trophy}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ═══ MAIN COLUMN ═══ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ═══ DEALS TABLE ═══ */}
          <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
            <h2 className="font-bold text-base">My Deals</h2>
            <Link
              href="/deals/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--crimson)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--crimson-dark)] transition-colors"
            >
              <Plus className="w-3 h-3" />
              New Deal
            </Link>
          </div>

          {dealsLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--text-secondary)]">No deals yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Submit your first interest signal to get started</p>
              <Link
                href="/deals/new"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[var(--crimson)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--crimson-dark)] transition-colors"
              >
                <Plus className="w-3 h-3" />
                Submit Interest Signal
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {deals.slice(0, 5).map((deal: any) => {
                const statusMeta = DEAL_STATUS_META[deal.status] || { label: deal.status, variant: "default" as const };
                return (
                  <Link
                    key={deal._id}
                    href={`/deals/${deal._id}`}
                    className="flex items-center justify-between p-4 hover:bg-[var(--surface-alt)] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{deal.clientBusiness || deal.clientName}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{deal.serviceType}</div>
                    </div>
                    <div className="text-right mr-4">
                      <div className="text-sm font-semibold">{formatINR(deal.dealValue)}</div>
                      <div className="text-xs text-[var(--text-muted)]">{deal.pointsAwarded} pts</div>
                    </div>
                    <Badge variant={statusMeta.variant} size="sm">
                      {statusMeta.label}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] ml-2" />
                  </Link>
                );
              })}
            </div>
          )}

          {deals.length > 0 && (
            <div className="p-4 border-t border-[var(--border)] text-center">
              <Link href="/deals" className="text-xs text-[var(--crimson)] font-semibold hover:underline">
                View All {deals.length} Deals →
              </Link>
            </div>
          )}
        </div>

        {/* ═══ SCORE ACTIVITY FEED ═══ */}
        <div className="card p-5 border border-[var(--border)]">
          <h3 className="font-bold text-base font-display mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--crimson)]" />
            Score Activity
          </h3>
          {(scoresData?.scores || []).slice(0, 5).map((score: any) => (
            <div key={score._id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
              <span className={`text-sm font-black font-mono w-16 text-right flex-shrink-0 ${
                score.points > 0 ? 'text-[var(--success)]' : 'text-rose-500'
              }`}>
                {score.points > 0 ? '+' : ''}{score.points}
              </span>
              <span className="text-xs text-[var(--text-secondary)] truncate flex-1">{score.description}</span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono flex-shrink-0">
                {new Date(score.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
          {(!scoresData?.scores || scoresData.scores.length === 0) && (
            <p className="text-xs text-[var(--text-muted)] text-center py-4">No score activity yet. Claim a lead to get started!</p>
          )}
        </div>
      </div>

        {/* ═══ SIDEBAR CARDS ═══ */}
        <div className="space-y-6">
          {/* Simulated Earnings */}
          <div className="card p-4 border border-[var(--success)]/30 bg-[var(--success)]/5">
            <div className="text-xs font-bold text-[var(--success)] uppercase tracking-widest mb-1">Simulated Earnings</div>
            <div className="text-2xl font-black font-mono text-[var(--text-primary)]">
              ₹{simulatedEarnings.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              Based on your {user?.participantRole === 'deal_architect' ? '15%' : user?.participantRole === 'project_manager' ? '10%' : '45%'} commission on closed deals
            </div>
          </div>

          {/* Score Ring */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4">Orbit Score</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={tierMeta.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(Math.min(orbitScore, 1000) / 1000) * 327} 327`}
                    style={{ transition: "stroke-dasharray 1s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: tierMeta.color }}>{orbitScore}</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">/ 1000</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Badge variant="default" size="sm">{tierMeta.label} · {tierMeta.range}</Badge>
              {nextTier && (
                <p className="text-xs text-[var(--text-muted)] mt-2">{nextTier.gap} pts to {nextTier.next} tier</p>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No activity yet. Submit your first deal!</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        item.type === "success"
                          ? "bg-[var(--success)]"
                          : item.type === "danger"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <p className="text-xs text-[var(--text-primary)] leading-relaxed">{item.text}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: "/deals/new", icon: Plus, label: "Submit New Deal" },
                { href: "/briefing", icon: Clock, label: "Today's Briefing" },
                { href: "/team", icon: Users, label: "Team War Room" },
                { href: "/leaderboard", icon: BarChart3, label: "Leaderboard" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--surface-alt)] transition-colors text-sm"
                >
                  <link.icon className="w-4 h-4 text-[var(--crimson)]" />
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)] ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
