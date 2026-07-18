"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOrganizerOverview } from "@/hooks/useData";
import { formatINR, formatINRCompact } from "@/lib/utils";
import Link from "next/link";
import {
  Activity,
  DollarSign,
  Users,
  Trophy,
  Shield,
  Clock,
  ChevronRight,
  Flame,
  Zap,
  BarChart3,
  Megaphone,
} from "lucide-react";

import { useToast } from "@/components/ui/Toast";

export default function OrganizerWarRoomPage() {
  const { data, isLoading } = useOrganizerOverview();
  const { toast } = useToast();

  const event = data?.event;
  const stats = data?.stats || {};
  const rankedTeams = data?.rankedTeams || [];
  const topClosers = data?.topClosers || [];
  const dealPipeline = data?.dealPipeline || [];
  const recentActivity = data?.recentActivity || [];
  const nicheBreakdown = data?.nicheBreakdown || [];

  const currentDay = event?.currentDay ?? 1;
  const totalDays = event?.totalDays ?? 9;

  if (isLoading) {
    return (
      <DashboardLayout title="Organizer War Room" breadcrumbs={["Home", "Organizer Hub"]}>
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
    <DashboardLayout title="Organizer War Room" breadcrumbs={["Home", "Organizer Hub"]}>
      {/* Top Banner */}
      <div className="bg-[var(--dark)] text-white rounded-3xl p-8 mb-8 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[var(--crimson)]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-[var(--crimson)] rounded-full text-xs font-bold uppercase tracking-wider">
                Executive Command & Control
              </span>
              <Badge variant="warning" size="sm">Day {currentDay} · {event?.status === "active" ? "Live" : event?.status || "—"}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              GWD BizSim 2026 Organizer War Room
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
              Real-time telemetry across all {stats.totalParticipants || 0} participants, {stats.totalTeams || 0} teams, and {stats.totalDeals || 0} deals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="px-4 py-2.5 min-h-[44px] border border-white/20 rounded-xl text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2">
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
            <Link href="/leaderboard" className="px-4 py-2.5 min-h-[44px] bg-[var(--crimson)] rounded-xl text-sm font-bold hover:bg-[var(--crimson-dark)] transition-all flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value={(stats.totalParticipants || 0).toString()} label="Active Participants" icon={Users} />
        <StatCard value={(stats.totalDeals || 0).toString()} label="Total Deals" icon={Activity} />
        <StatCard value={formatINRCompact(stats.totalRevenue || 0)} label="Revenue Closed" icon={DollarSign} />
        <StatCard value={`${totalDays - currentDay}`} label="Days Remaining" icon={Clock} />
      </div>

      {/* Quick Actions */}
      <div className="card-glass p-5 border border-[var(--border)] mb-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">⚡ Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              if (!confirm(`Advance to Day ${currentDay + 1}?`)) return;
              try {
                toast.info("Advancing event day...");
                const res = await fetch('/api/admin/event', { 
                  method: 'PUT', 
                  headers: {'Content-Type':'application/json'}, 
                  body: JSON.stringify({action:'advance_day'}) 
                });
                if (res.ok) {
                  toast.success(`Successfully advanced to Day ${currentDay + 1}!`);
                  setTimeout(() => window.location.reload(), 1000);
                } else {
                  const data = await res.json();
                  toast.error(data.error || "Failed to advance day.");
                }
              } catch (err) {
                console.error(err);
                toast.error("Network error advancing event day.");
              }
            }}
            className="px-4 py-2 rounded-xl bg-[var(--dark)] text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" /> Advance Day
          </button>
          <button
            onClick={async () => {
              const action = event?.status === 'active' ? 'pause' : 'resume';
              try {
                toast.info(`${action === 'pause' ? 'Pausing' : 'Resuming'} event...`);
                const res = await fetch('/api/admin/event', { 
                  method: 'PUT', 
                  headers: {'Content-Type':'application/json'}, 
                  body: JSON.stringify({action}) 
                });
                if (res.ok) {
                  toast.success(`Event successfully ${action}d!`);
                  setTimeout(() => window.location.reload(), 1000);
                } else {
                  const data = await res.json();
                  toast.error(data.error || `Failed to ${action} event.`);
                }
              } catch (err) {
                console.error(err);
                toast.error(`Network error attempting to ${action} event.`);
              }
            }}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-primary)] text-xs font-bold hover:bg-[var(--surface-alt)] transition-all flex items-center gap-2"
          >
            {event?.status === 'active' ? '⏸ Pause Event' : '▶ Resume Event'}
          </button>
          <a
            href="/admin/events"
            className="px-4 py-2 rounded-xl border border-[var(--crimson)]/30 text-[var(--crimson)] text-xs font-bold hover:bg-[var(--crimson-pale)] transition-all flex items-center gap-2"
          >
            <Megaphone className="w-3.5 h-3.5" /> Full Event Controls
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Team Rankings */}
          <div className="card-glass p-0 overflow-hidden border border-[var(--border)] shadow-md">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-alt)]/60">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[var(--crimson)]" />
                <h2 className="font-extrabold text-base font-display">Team Rankings</h2>
              </div>
              <Link href="/leaderboard" className="text-xs text-[var(--crimson)] font-bold hover:underline">
                Full Board →
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {rankedTeams.map((team: any, i: number) => (
                <div key={team._id} className="flex items-center justify-between p-4 hover:bg-[var(--surface-alt)] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`font-extrabold font-mono text-lg ${i < 3 ? "text-[var(--crimson)]" : "text-[var(--text-muted)]"}`}>
                      #{i + 1}
                    </span>
                    <span className="text-xl">{team.emoji}</span>
                    <div>
                      <div className="font-bold text-sm font-display">{team.name}</div>
                      <div className="text-xs text-[var(--text-muted)] font-mono">
                        {team.nicheId?.icon} {team.nicheId?.name || "—"} · {team.totalDeals || 0} deals · {formatINRCompact(team.totalRevenue || 0)}
                      </div>
                    </div>
                  </div>
                  <span className="font-black font-mono text-lg text-[var(--crimson)]">{team.totalScore}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Split Preview */}
          <div className="card-glass p-6 border border-[var(--border)] shadow-md">
            <h3 className="text-lg font-bold mb-1">💰 Simulated Payout Preview</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Based on current closed deals ({formatINRCompact(stats.totalRevenue || 0)} total revenue)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { role: 'GWD Global', pct: 20, color: 'text-[var(--crimson)]' },
                { role: 'Deal Architects', pct: 15, color: 'text-amber-600' },
                { role: 'Project Managers', pct: 10, color: 'text-blue-600' },
                { role: 'Devs & Designers', pct: 45, color: 'text-emerald-600' },
              ].map(({ role, pct, color }) => {
                const amount = Math.round((stats.totalRevenue || 0) * pct / 100);
                return (
                  <div key={role} className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
                    <div className={`text-xl font-black font-mono ${color}`}>
                      {formatINRCompact(amount)}
                    </div>
                    <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{role}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{pct}% commission</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: Top Closers + Pipeline */}
        <div className="space-y-6">
          {/* Top Closers */}
          <div className="card-glass p-5 border border-[var(--border)] shadow-sm">
            <h3 className="font-extrabold text-sm font-display mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" /> Top Closers
            </h3>
            <div className="space-y-3">
              {topClosers.slice(0, 5).map((user: any, i: number) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i < 3 ? "bg-[var(--crimson)] text-white" : "bg-[var(--surface-alt)] text-[var(--text-muted)]"
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold">{user.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{user.teamId?.emoji} {user.teamId?.name || "—"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[var(--crimson)]">{user.orbitScore}</span>
                    <span className="text-[10px] text-[var(--text-muted)] ml-1">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deal Pipeline Status */}
          <div className="card-glass p-5 border border-[var(--border)] shadow-sm">
            <h3 className="font-extrabold text-sm font-display mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--crimson)]" /> Deal Pipeline
            </h3>
            <div className="space-y-2.5">
              {dealPipeline.slice(0, 6).map((stage: any) => (
                <div key={stage._id} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] capitalize">{(stage._id || "unknown").replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{stage.count}</span>
                    <span className="text-[var(--text-muted)]">({formatINRCompact(stage.value || 0)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Niche Breakdown */}
          <div className="card-glass p-5 border border-[var(--border)] shadow-sm">
            <h3 className="font-extrabold text-sm font-display mb-4">Niche Breakdown</h3>
            <div className="space-y-3">
              {nicheBreakdown.map((niche: any) => (
                <div key={niche._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{niche.icon}</span>
                    <span className="text-sm font-semibold">{niche.name}</span>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <span className="font-bold">{niche.deals}</span> deals · {formatINRCompact(niche.revenue || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-glass p-5 border border-[var(--border)] shadow-md">
        <h3 className="font-extrabold text-base font-display mb-4">Recent Scoring Activity</h3>
        <div className="space-y-2.5">
          {recentActivity.slice(0, 10).map((score: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--surface-alt)] transition-colors text-sm">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[var(--crimson-pale)] flex items-center justify-center text-[10px] font-bold text-[var(--crimson)]">
                  {score.userId?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                </div>
                <div>
                  <span className="font-semibold">{score.userId?.name || "Unknown"}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-2">{score.description}</span>
                </div>
              </div>
              <span className={`font-mono font-bold ${score.points > 0 ? "text-emerald-600" : "text-red-500"}`}>
                {score.points > 0 ? "+" : ""}{score.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
