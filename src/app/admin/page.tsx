"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useAdminOverview, useEvent, useDeals } from "@/hooks/useData";
import { apiMutate } from "@/lib/api-client";
import { DEAL_STATUS_META } from "@/lib/dealUtils";
import { formatINR, formatINRCompact } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  Target,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronRight,
  Pause,
  Play,
  Megaphone,
  BarChart3,
  Shield,
  Inbox,
  FastForward,
} from "lucide-react";

export default function AdminPage() {
  const { data, isLoading, mutate: refreshOverview } = useAdminOverview();
  const { data: eventData, mutate: refreshEvent } = useEvent();
  const { data: pendingData, mutate: refreshDeals } = useDeals({ status: "admin_pending_contact" });
  const { toast } = useToast();
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [showBroadcast, setShowBroadcast] = useState(false);

  const stats = data?.stats || {};
  const topTeams = data?.topTeams || [];
  const recentActivity = data?.recentActivity || [];
  const dealsByStatus = data?.dealsByStatus || {};
  const event = eventData?.event;
  const pendingDeals = pendingData?.deals || [];

  const currentDay = event?.currentDay ?? 1;
  const totalDays = event?.totalDays ?? 9;
  const eventStatus = event?.status ?? "active";

  const handleEventAction = useCallback(async (action: string) => {
    const { error } = await apiMutate("/api/admin/event", { method: "PUT", body: { action } });
    if (error) { toast.error(error); return; }
    toast.success(action === "advance_day" ? `Advanced to Day ${currentDay + 1}!` : action === "pause" ? "Event paused" : "Event resumed");
    refreshEvent();
    refreshOverview();
  }, [currentDay, toast, refreshEvent, refreshOverview]);

  const handleBroadcast = useCallback(async () => {
    if (!broadcastMsg.trim()) return;
    const { error } = await apiMutate("/api/admin/event", { method: "PUT", body: { action: "broadcast", broadcastMessage: broadcastMsg } });
    if (error) { toast.error(error); return; }
    toast.success("Broadcast sent!");
    setBroadcastMsg("");
    setShowBroadcast(false);
  }, [broadcastMsg, toast]);

  const handleDealAction = useCallback(async (dealId: string, action: string) => {
    const { error } = await apiMutate(`/api/deals/${dealId}`, { method: "PUT", body: { action } });
    if (error) { toast.error(error); return; }
    toast.success(`Deal ${action === "handoff_contact" ? "contacted" : "rejected"}!`);
    refreshDeals();
    refreshOverview();
  }, [toast, refreshDeals, refreshOverview]);

  if (isLoading) {
    return (
      <DashboardLayout title="Admin Overview" breadcrumbs={["Admin", "Overview"]}>
        <div className="space-y-6">
          <Skeleton className="h-16 rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Overview" breadcrumbs={["Admin", "Overview"]}>
      <div className="animate-slide-up space-y-8 font-sans">
        {/* ═══ EVENT STATUS BAR ═══ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-2xl bg-[var(--dark)] text-white shadow-md gap-4 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-3 h-3 rounded-full ${eventStatus === "active" ? "bg-green-400 animate-ping" : "bg-yellow-400"}`} />
              <span className="font-extrabold text-sm sm:text-base font-display tracking-tight">
                BizSim 2026 — {eventStatus === "active" ? "LIVE" : eventStatus.toUpperCase()}
              </span>
            </div>
            <Badge variant="warning" size="sm" className="font-mono text-xs shadow-2xs">Day {currentDay} of {totalDays}</Badge>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleEventAction(eventStatus === "paused" ? "resume" : "pause")}
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95"
              title={eventStatus === "paused" ? "Resume Event" : "Pause Event"}
            >
              {eventStatus === "paused" ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleEventAction("advance_day")}
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95"
              title="Advance Day"
            >
              <FastForward className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowBroadcast(!showBroadcast)}
              className="btn-glow flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] transition-all text-xs sm:text-sm font-bold active:scale-98 shadow-sm"
            >
              <Megaphone className="w-4 h-4" /> Broadcast
            </button>
          </div>
        </div>

        {/* Broadcast input */}
        {showBroadcast && (
          <div className="card p-4 flex gap-3 items-center">
            <input
              type="text"
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Type broadcast message..."
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-sm outline-none focus:ring-2 focus:ring-[var(--crimson)]/30"
              onKeyDown={(e) => e.key === "Enter" && handleBroadcast()}
            />
            <button onClick={handleBroadcast} className="px-4 py-2 bg-[var(--crimson)] text-white text-xs font-bold rounded-lg hover:bg-[var(--crimson-dark)] transition-colors">
              Send
            </button>
          </div>
        )}

        {/* ═══ STATS GRID ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value={(stats.totalParticipants || 0).toString()} label="Participants" icon={Users} />
          <StatCard value={(stats.totalDeals || 0).toString()} label="Deals Submitted" icon={Target} />
          <StatCard value={formatINRCompact(stats.totalRevenue || 0)} label="Revenue Generated" icon={DollarSign} />
          <StatCard value={(stats.pendingDeals || 0).toString()} label="Pending Verification" icon={Clock} trend={stats.pendingDeals > 0 ? "up" : undefined} trendValue={stats.pendingDeals > 0 ? `${stats.pendingDeals} pending` : undefined} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ VERIFICATION QUEUE ═══ */}
          <div className="lg:col-span-2 card-glass p-0 overflow-hidden border border-[var(--border)] shadow-md">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-alt)]/60">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[var(--crimson)]" />
                <h2 className="font-extrabold text-base sm:text-lg font-display tracking-tight">Verification Queue</h2>
                <span className="px-2.5 py-0.5 bg-[var(--crimson-pale)] text-[var(--crimson)] text-xs font-mono font-bold rounded-full border border-[var(--crimson)]/20 shadow-2xs">
                  {pendingDeals.length}
                </span>
              </div>
              <Link href="/admin/deals" className="text-xs sm:text-sm text-[var(--crimson)] font-bold hover:underline flex items-center gap-1 active:scale-98">
                View All →
              </Link>
            </div>
            {pendingDeals.length === 0 ? (
              <div className="p-10 text-center">
                <Inbox className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[var(--text-secondary)]">No pending deals</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">All deals have been reviewed</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {pendingDeals.slice(0, 5).map((deal: any) => (
                  <div key={deal._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4.5 hover:bg-[var(--surface-alt)] transition-all gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm sm:text-base font-display">{deal.clientBusiness || deal.clientName}</span>
                        <Badge variant="warning" size="sm" className="font-mono text-[10px]">Pending</Badge>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-medium mt-1">
                        <strong className="text-[var(--text-primary)]">{deal.dealArchitectId?.name || "—"}</strong> · {deal.teamId?.name || "—"} · {deal.serviceType}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-left sm:text-right">
                        <div className="text-sm sm:text-base font-black font-mono text-[var(--crimson)]">{formatINR(deal.dealValue)}</div>
                        <div className="text-xs text-[var(--text-muted)] font-medium">{deal.serviceType}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link href={`/deals/${deal._id}`} className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-all active:scale-90" title="Review">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDealAction(deal._id, "handoff_contact")} className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all active:scale-90" title="Contact Client">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDealAction(deal._id, "cold_lead")} className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-rose-500 transition-all active:scale-90" title="Mark Cold">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══ SIDEBAR ═══ */}
          <div className="space-y-6">
            {/* Verification Stats */}
            <div className="card-glass p-5 border border-[var(--border)] shadow-sm transition-transform hover:-translate-y-0.5">
              <h3 className="font-extrabold text-sm sm:text-base font-display mb-4 tracking-tight">Deal Pipeline</h3>
              <div className="space-y-3.5">
                {[
                  { label: "Closed & Paid", value: stats.closedDeals || 0, color: "bg-[var(--success)]", total: stats.totalDeals || 1 },
                  { label: "Pending", value: stats.pendingDeals || 0, color: "bg-[var(--warning)]", total: stats.totalDeals || 1 },
                  { label: "In Pipeline", value: Math.max(0, (stats.totalDeals || 0) - (stats.closedDeals || 0) - (stats.pendingDeals || 0)), color: "bg-blue-500", total: stats.totalDeals || 1 },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5 font-medium">
                      <span className="text-[var(--text-secondary)]">{stat.label}</span>
                      <span className="font-bold font-mono">{stat.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--surface-alt)] overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${stat.color} transition-all duration-500`}
                        style={{ width: `${Math.min(100, (stat.value / stat.total) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Rankings */}
            <div className="card-glass p-5 border border-[var(--border)] shadow-sm transition-transform hover:-translate-y-0.5">
              <h3 className="font-extrabold text-sm sm:text-base font-display mb-4 tracking-tight">Team Rankings</h3>
              <div className="space-y-3.5">
                {topTeams.slice(0, 5).map((team: any, index: number) => (
                  <div key={team._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{team.emoji}</span>
                      <div>
                        <div className="text-sm font-bold font-display">{team.name}</div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">{team.totalDeals || 0} deals · {team.totalScore} pts</div>
                      </div>
                    </div>
                    <Badge variant={index === 0 ? "success" : index <= 2 ? "default" : "warning"} size="sm" className="font-mono text-[10px]">
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-glass p-5 border border-[var(--border)] shadow-sm transition-transform hover:-translate-y-0.5">
              <h3 className="font-extrabold text-sm sm:text-base font-display mb-3 tracking-tight">Admin Actions</h3>
              <div className="space-y-2">
                {[
                  { href: "/admin/deals", icon: Shield, label: "Verification Queue" },
                  { href: "/admin/users", icon: Users, label: "Manage Users" },
                  { href: "/leaderboard", icon: BarChart3, label: "Leaderboard" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-alt)] transition-all text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-[var(--crimson)] active:scale-98">
                    <div className="w-8 h-8 rounded-lg bg-[var(--crimson-pale)] flex items-center justify-center">
                      <link.icon className="w-4 h-4 text-[var(--crimson)]" />
                    </div>
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
