"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import {
  Columns3,
  PlusCircle,
  Search,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  DollarSign,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Inbox,
} from "lucide-react";
import { useDeals } from "@/hooks/useData";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";

interface KanbanCardItem {
  id: string;
  client: string;
  service: string;
  value: number;
  owner: string;
  role: string;
  status: "discovery" | "proposal" | "build" | "review" | "completed";
  points: number;
  lastUpdated: string;
}

const COLUMNS = [
  { id: "discovery", title: "Discovery / Pitched", color: "border-blue-400 bg-blue-50/40" },
  { id: "proposal", title: "Proposal / Payment", color: "border-amber-400 bg-amber-50/40" },
  { id: "build", title: "In Progress (Build)", color: "border-purple-400 bg-purple-50/40" },
  { id: "review", title: "Client Review", color: "border-indigo-400 bg-indigo-50/40" },
  { id: "completed", title: "Completed / Closed", color: "border-green-500 bg-green-50/40" },
];

export default function KanbanPage() {
  const { isStaff, role: userRole } = useUserRole();
  const { data: dealsData, isLoading, mutate } = useDeals();
  const { toast } = useToast();
  
  const [localBoard, setLocalBoard] = useState<KanbanCardItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync local board when real deals load from database
  useEffect(() => {
    if (dealsData?.deals) {
      const mapped = dealsData.deals.map((deal: any) => {
        let status: KanbanCardItem["status"] = "discovery";
        switch (deal.status) {
          case "submitted":
          case "admin_pending_contact":
          case "gwd_contacted":
            status = "discovery";
            break;
          case "proposal_sent":
          case "negotiating":
            status = "proposal";
            break;
          case "delivery_assigned":
          case "delivery_in_progress":
            status = "build";
            break;
          case "delivery_qa_pass":
          case "client_delivered":
            status = "review";
            break;
          case "gwd_closed_paid":
          case "client_approved":
            status = "completed";
            break;
          default:
            status = "discovery";
        }

        return {
          id: deal._id,
          client: deal.clientBusiness || deal.clientName,
          service: deal.serviceType,
          value: deal.dealValue || 0,
          owner: deal.dealArchitectId?.name || "Unassigned",
          role: deal.dealArchitectId?.participantRole === "deal_architect" ? "DA" : 
                deal.dealArchitectId?.participantRole === "project_manager" ? "PM" : 
                deal.dealArchitectId?.participantRole === "developer" ? "Dev" : 
                deal.dealArchitectId?.participantRole === "designer" ? "Des" : "WC",
          status,
          points: deal.pointsAwarded || 0,
          lastUpdated: new Date(deal.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        };
      });
      setLocalBoard(mapped);
    }
  }, [dealsData]);

  const getMoveAction = (targetStatus: string) => {
    switch (targetStatus) {
      case "discovery": return { action: "gwd_contacted" };
      case "proposal": return { action: "proposal_sent" };
      case "build": return { action: "assign_delivery", payload: { deliveryAssignment: "participant_supervised" } };
      case "review": return { action: "delivery_qa_pass" };
      case "completed": return { action: "client_approved" };
      default: return null;
    }
  };

  const moveCard = async (id: string, direction: "next" | "prev") => {
    const card = localBoard.find((c) => c.id === id);
    if (!card) return;

    const colOrder: KanbanCardItem["status"][] = ["discovery", "proposal", "build", "review", "completed"];
    const currentIndex = colOrder.indexOf(card.status);
    let nextStatus: KanbanCardItem["status"] | null = null;
    
    if (direction === "next" && currentIndex < colOrder.length - 1) {
      nextStatus = colOrder[currentIndex + 1];
    } else if (direction === "prev" && currentIndex > 0) {
      nextStatus = colOrder[currentIndex - 1];
    }

    if (!nextStatus) return;

    if (isStaff) {
      const moveInfo = getMoveAction(nextStatus);
      if (!moveInfo) return;
      toast.info(`Updating status of ${card.client}...`);
      try {
        const res = await fetch(`/api/deals/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: moveInfo.action, ...moveInfo.payload }),
        });
        if (res.ok) {
          toast.success(`Successfully moved ${card.client} to ${nextStatus}!`);
          mutate(); // Re-fetch SWR deals
        } else {
          const errData = await res.json();
          toast.error(errData.error || "Failed to update deal status.");
        }
      } catch (err) {
        toast.error("Network error updating status.");
      }
    } else {
      // Local optimistic update for participants with education alert
      toast.warning("Local simulation move only. GWD Admins verify evidence to update the live scoreboard.");
      setLocalBoard((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: nextStatus as any, lastUpdated: "Just now" } : c))
      );
    }
  };

  const filteredBoard = localBoard.filter(
    (c) =>
      c.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Project Delivery Kanban" breadcrumbs={["Home", "Deals", "Kanban"]}>
      <div className="animate-slide-up">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
              Team Delivery Kanban Board
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 max-w-2xl">
              Manage active client deals across stages from initial pitch to final delivery sign-off.
              {!isStaff && " (Participant View: Moves are simulated locally)"}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter deals or owners..."
                className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-white dark:bg-[var(--surface)] transition-colors"
              />
            </div>
            <Link
              href="/deals/new"
              className="btn-glow px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap active:scale-98 bg-[var(--crimson)] text-white hover:bg-[var(--crimson-dark)]"
            >
              <PlusCircle className="w-4 h-4" /> New Deal
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && localBoard.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className="card p-4 space-y-4">
                <Skeleton className="h-10 rounded-lg w-3/4" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredBoard.length === 0 && !isLoading ? (
          <div className="card p-12 text-center border-dashed border-2 border-[var(--border)] max-w-lg mx-auto">
            <Inbox className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <h3 className="font-bold text-lg text-[var(--text-primary)]">No Deals Found</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1.5">
              Submit your first client deal or interest signal to populate the delivery Kanban board.
            </p>
            <Link
              href="/deals/new"
              className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 bg-[var(--crimson)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--crimson-dark)] transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Submit Interest Signal
            </Link>
          </div>
        ) : (
          /* Kanban Columns Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-6">
            {COLUMNS.map((col, colIdx) => {
              const cardsInCol = filteredBoard.filter((c) => c.status === col.id);
              const colValue = cardsInCol.reduce((acc, c) => acc + c.value, 0);

              return (
                <div key={col.id} className="card rounded-2xl border border-[var(--border)] p-3.5 flex flex-col min-w-[250px] max-h-[740px] shadow-sm transition-all" style={{ animationDelay: `${colIdx * 80}ms` }}>
                  {/* Column Header */}
                  <div className={`p-3.5 rounded-xl border-t-4 ${col.color} mb-3 shadow-2xs transition-transform hover:-translate-y-0.5`}>
                    <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-[var(--text-primary)] font-display">
                      <span>{col.title}</span>
                      <span className="bg-white dark:bg-black/40 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-extrabold border border-[var(--border)] shadow-2xs">
                        {cardsInCol.length}
                      </span>
                    </div>
                    {colValue > 0 && (
                      <div className="text-[11px] font-bold font-mono text-[var(--crimson)] mt-1 tracking-tight">
                        Total: ₹{(colValue / 1000).toFixed(0)}K
                      </div>
                    )}
                  </div>

                  {/* Cards Container */}
                  <div className="space-y-3 overflow-y-auto flex-1 pr-0.5 no-scrollbar min-h-[150px]">
                    {cardsInCol.map((card) => (
                      <div key={card.id} className="card p-4 bg-[var(--surface-card)] transition-all duration-300 shadow-2xs hover:shadow-sm">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Link href={`/deals/${card.id}`} className="font-bold text-sm text-[var(--text-primary)] hover:text-[var(--crimson)] transition-colors line-clamp-1 font-display">
                            {card.client}
                          </Link>
                          <span className="text-xs font-black font-mono text-[var(--crimson)] whitespace-nowrap ml-1 bg-[var(--surface-alt)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                            ₹{(card.value / 1000).toFixed(0)}K
                          </span>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3 font-medium">
                          {card.service}
                        </p>

                        <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border)]/60 text-[11px]">
                          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                            <span className="w-5 h-5 rounded-full bg-[var(--crimson)] text-white flex items-center justify-center text-[9px] font-mono font-extrabold shadow-2xs">
                              {card.role}
                            </span>
                            <span className="truncate max-w-[95px]">{card.owner.split(" ")[0]}</span>
                          </div>
                          <span className="text-[var(--text-muted)] font-mono text-[10px]">{card.lastUpdated}</span>
                        </div>

                        {/* Quick Stage Move Buttons */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-dashed border-[var(--border)] gap-1">
                          <button
                            onClick={() => moveCard(card.id, "prev")}
                            disabled={col.id === "discovery"}
                            className="px-2 py-1.5 min-h-[36px] rounded-lg bg-[var(--surface-alt)] hover:bg-[var(--surface-card)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-0.5 transition-all border border-[var(--border)] active:scale-95 cursor-pointer"
                            title="Move Left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" /> Prev
                          </button>

                          {card.points > 0 ? (
                            <span className="text-[11px] font-bold font-mono text-[var(--success)] bg-[var(--success-pale)] px-2 py-0.5 rounded-md border border-emerald-500/20">
                              +{card.points} pts
                            </span>
                          ) : (
                            <Link href={`/deals/${card.id}`} className="text-[11px] font-bold text-[var(--crimson)] hover:underline flex items-center">
                              Inspect →
                            </Link>
                          )}

                          <button
                            onClick={() => moveCard(card.id, "next")}
                            disabled={col.id === "completed"}
                            className="px-2 py-1.5 min-h-[36px] rounded-lg bg-[var(--surface-alt)] hover:bg-[var(--crimson-pale)] hover:text-[var(--crimson)] text-[11px] font-bold text-[var(--text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-0.5 transition-all border border-[var(--border)] active:scale-95 cursor-pointer"
                            title="Move Right"
                          >
                            Next <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {cardsInCol.length === 0 && (
                      <div className="py-10 text-center border border-dashed border-[var(--border)] rounded-2xl bg-white/40 dark:bg-black/10">
                        <p className="text-xs text-[var(--text-muted)] font-medium">No deals in this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
