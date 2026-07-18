"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import {
  Briefcase,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Calendar,
  Shield,
  Sparkles,
  Lock,
  Inbox,
} from "lucide-react";
import { DealCardSkeleton } from "@/components/ui/Skeleton";
import { useDeals } from "@/hooks/useData";
import { DEAL_STATUS_META } from "@/lib/dealUtils";
import { formatINR, formatINRCompact } from "@/lib/utils";

/** Deal list item type — mirrors the API masked response */
interface DealEntry {
  _id: string;
  clientName?: string;
  clientBusiness: string;
  serviceType: string;
  dealValue: number;
  gwdFinalDealValue?: number;
  status: string;
  pointsAwarded?: number;
  bonusPoints?: number;
  createdAt?: string;
  deliveryStatus?: string;
  deliveryAssignment?: string;
  notes?: string;
  rejectionReason?: string;
  dealArchitectId?: { name: string; avatar: string };
  teamId?: { name: string; emoji: string };
}

export default function MyDealsPage() {
  const { data, error, isLoading } = useDeals();
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const deals: DealEntry[] = (data?.deals as DealEntry[]) ?? [];

  const filteredDeals = deals.filter((d) => {
    const status = d.status || "admin_pending_contact";
    if (filter === "closed") {
      if (!["gwd_closed_paid", "approved", "delivery_assigned", "delivery_qa_pass", "client_delivered", "client_approved"].includes(status)) return false;
    } else if (filter === "active") {
      if (!["submitted", "admin_pending_contact", "gwd_contacted", "proposal_sent", "negotiating"].includes(status)) return false;
    } else if (filter === "cold") {
      if (!["lead_cold", "rejected"].includes(status)) return false;
    }
    if (
      searchQuery &&
      !((d.clientBusiness || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
      !((d.clientName || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
      !((d.serviceType || "").toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const meta = DEAL_STATUS_META[status];
    if (meta) {
      return <Badge variant={meta.variant === "info" || meta.variant === "danger" ? "default" : meta.variant} size="sm">{meta.label}</Badge>;
    }
    return <Badge variant="outline" size="sm">{status.replace(/_/g, " ")}</Badge>;
  };

  return (
    <DashboardLayout title="My Deals Pipeline" breadcrumbs={["Home", "Deals", "Pipeline"]}>
      <div className="animate-slide-up">
        {/* Header Bar with Action Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[var(--crimson)] text-white text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                <Shield className="w-3.5 h-3.5 animate-pulse" /> GWD Official Pipeline
              </span>
              <Badge variant="default" size="sm" className="font-mono shadow-2xs">Vault Protected Leads</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
              Client Interest Signals & GWD Pipeline
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 max-w-2xl">
              Track your originated client leads, monitor official GWD contract closures, and verify leaderboard point payouts.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/deals/kanban"
              className="px-4 py-2.5 min-h-[44px] border border-[var(--border)] rounded-xl text-sm font-semibold text-[var(--text-primary)] bg-[var(--surface-card)] hover:bg-[var(--surface-alt)] transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98"
            >
              <span>Kanban Board</span>
            </Link>
            <Link
              href="/deals/new"
              className="btn-glow px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Interest Signal</span>
            </Link>
          </div>
        </div>

        {/* Summary Stats Strip */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card-glass p-5 transition-transform hover:-translate-y-1">
              <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Signals Submitted</div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1.5 font-mono tracking-tight">{deals.length} leads</div>
            </div>
            <div className="card-glass p-5 transition-transform hover:-translate-y-1">
              <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Closed & Paid to GWD</div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--success)] mt-1.5 font-mono tracking-tight">
                {deals.filter((d) => ["gwd_closed_paid", "approved", "delivery_assigned", "delivery_qa_pass", "client_delivered", "client_approved"].includes(d.status || "")).length} deals
              </div>
            </div>
            <div className="card-glass p-5 transition-transform hover:-translate-y-1">
              <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Originated Pipeline</div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--crimson)] mt-1.5 font-mono tracking-tight">
                {formatINRCompact(deals.reduce((acc, d) => acc + Number(d.gwdFinalDealValue || d.dealValue || 0), 0))}
              </div>
            </div>
            <div className="card-glass p-5 transition-transform hover:-translate-y-1">
              <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Total Points Earned</div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--crimson)] mt-1.5 font-mono tracking-tight">
                +{deals.reduce((acc, d) => acc + Math.max(0, d.pointsAwarded ?? 0) + (d.bonusPoints ?? 0), 0)} pts
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="card-glass p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs (scrollable + 44px min-height) */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {[
              { id: "all", label: "All Pipeline Leads" },
              { id: "active", label: "Active Follow-up (Stage 1-3)" },
              { id: "closed", label: "Closed & Paid (Stage 4-5)" },
              { id: "cold", label: "Cold Leads" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? "bg-[var(--crimson)] text-white shadow-sm scale-[1.02]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] active:scale-98"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search business or service..."
              className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Deals List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="card divide-y divide-[var(--border)]">
              {[1, 2, 3].map((i) => <DealCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="card-glass p-12 text-center border border-dashed border-red-300">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-[var(--text-primary)] font-display">Failed to load deals</h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
                {error?.message || "Something went wrong. Please try again later."}
              </p>
            </div>
          ) : deals.length === 0 ? (
            <div className="card-glass p-12 text-center border border-dashed border-[var(--border)]">
              <Inbox className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 animate-float" />
              <h3 className="font-bold text-lg text-[var(--text-primary)] font-display">No deals yet</h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
                Submit your first client interest signal to hand off to GWD and unlock massive leaderboard points!
              </p>
              <Link
                href="/deals/new"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[var(--crimson)] text-white font-semibold rounded-xl text-sm hover:bg-[var(--crimson-dark)] transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> Submit Interest Signal
              </Link>
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="card-glass p-12 text-center border border-dashed border-[var(--border)]">
              <Briefcase className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 animate-float" />
              <h3 className="font-bold text-lg text-[var(--text-primary)] font-display">No pipeline deals found</h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">No deals match your current filters. Try adjusting your search or filter criteria.</p>
            </div>
          ) : filteredDeals.map((deal, index) => {
            const status = deal.status || "admin_pending_contact";
            return (
              <div
                key={deal._id}
                className={`card-interactive p-5 sm:p-6 bg-[var(--surface-card)] transition-all duration-300 ${
                  ["lead_cold", "rejected"].includes(status) ? "border-amber-300/60 opacity-85" : ""
                }`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                      <span className="text-xs font-extrabold font-mono text-[var(--text-muted)] bg-[var(--surface-alt)] px-2 py-0.5 rounded-md border border-[var(--border)]">#{deal._id.slice(-6)}</span>
                      {getStatusBadge(status)}
                      {deal.createdAt && (
                        <span className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(deal.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                      <span className="text-[11px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Contact Vaulted
                      </span>
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-[var(--text-primary)] font-display">{deal.clientBusiness || deal.clientName}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">
                      <strong className="text-[var(--text-primary)]">Service:</strong> {deal.serviceType} &nbsp;•&nbsp; <strong className="text-[var(--text-primary)]">Contact:</strong> {deal.clientName}
                    </p>

                    {deal.rejectionReason && (
                      <div className="mt-3 p-3.5 rounded-xl bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 shadow-2xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">GWD Sales Status Note:</strong> {deal.rejectionReason}
                        </div>
                      </div>
                    )}
                    {deal.notes && !deal.rejectionReason && (
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] italic mt-2.5 bg-[var(--surface-alt)] p-2.5 rounded-lg border border-[var(--border)]">&quot;{deal.notes}&quot;</p>
                    )}
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 gap-3 min-w-[200px]">
                    <div className="text-left md:text-right">
                      <div className="text-xl sm:text-2xl font-black text-[var(--crimson)] font-mono tracking-tight">{formatINR(Number(deal.gwdFinalDealValue || deal.dealValue || 0))}</div>
                      <div className="text-xs sm:text-sm font-bold text-[var(--success)] font-mono mt-0.5">
                        {(deal.pointsAwarded || 0) + (deal.bonusPoints || 0) > 0 ? `+${(deal.pointsAwarded || 0) + (deal.bonusPoints || 0)} pts earned` : "+10 pts submitted"}
                      </div>
                    </div>

                    <Link
                      href={`/deals/${deal._id}`}
                      className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--crimson-pale)] text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-[var(--crimson)] transition-all flex items-center justify-center gap-1.5 border border-[var(--border)] shadow-2xs active:scale-98"
                    >
                      <span>View Timeline Tracker</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
