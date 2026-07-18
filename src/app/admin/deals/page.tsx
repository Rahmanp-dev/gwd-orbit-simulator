"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  FileText,
  CreditCard,
  Camera,
  ExternalLink,
  Search,
  Filter,
  AlertCircle,
  ChevronLeft,
  DollarSign,
  Award,
  Phone,
  Mail,
  Lock,
  MessageSquare,
  Building2,
  Sparkles,
  Upload,
  UserCheck,
  Send,
  Briefcase,
  Check,
} from "lucide-react";

import { useToast } from "@/components/ui/Toast";

const INITIAL_QUEUE = [
  {
    _id: "d102",
    clientName: "Priya Sharma",
    clientBusiness: "Bloom Boutique Fashion",
    clientPhone: "+91 98450 12345",
    clientEmail: "priya@bloomboutique.in",
    serviceType: "Shopify Store + Custom UI",
    dealValue: 45000,
    participantEstimatedValue: 45000,
    createdAt: "Day 4, 11:30 AM (25m ago)",
    status: "admin_pending_contact",
    dealArchitectId: { name: "Sneha Patel", avatar: "SP", participantRole: "Project Manager" },
    teamId: { name: "Team Phoenix (#1)", emoji: "🔥" },
    evidence: {
      interestSignalUrl: "https://whatsapp.com/proof-bloom",
      notes: "Priya wants her summer collection online before July 20th. Ready for call.",
    },
  },
  {
    _id: "d104",
    clientName: "Rajesh Rao",
    clientBusiness: "Vedic Wellness Retreat",
    clientPhone: "+91 97411 88990",
    clientEmail: "contact@vedicwellness.com",
    serviceType: "Social Media Management + WhatsApp Bot",
    dealValue: 25000,
    participantEstimatedValue: 25000,
    createdAt: "Day 4, 02:15 PM (10m ago)",
    status: "gwd_contacted",
    dealArchitectId: { name: "Vikram Mehta", avatar: "VM", participantRole: "Deal Architect" },
    teamId: { name: "Team Titan (#2)", emoji: "🚀" },
    evidence: {
      interestSignalUrl: "https://whatsapp.com/proof-vedic",
      notes: "Called Rajesh. He is waiting for GWD proposal with Razorpay link.",
    },
  },
  {
    _id: "d101",
    clientName: "Dr. Sharma",
    clientBusiness: "Sunshine Dental Clinic",
    clientPhone: "+91 99800 55443",
    clientEmail: "doctor@sunshinedental.com",
    serviceType: "Appointment Booking Engine + SEO",
    dealValue: 35000,
    gwdFinalDealValue: 35000,
    createdAt: "Day 3, 11:30 AM",
    status: "gwd_closed_paid",
    pointsAwarded: 67,
    dealArchitectId: { name: "Arjun Reddy", avatar: "AR", participantRole: "Deal Architect" },
    teamId: { name: "Team Phoenix (#1)", emoji: "🔥" },
    deliveryAssignment: "participant_supervised",
    deliveryQA: {
      adminQaStatus: "pending",
      participantDeliverableUrls: ["https://sunshine-preview.vercel.app"],
    },
    evidence: {
      interestSignalUrl: "https://whatsapp.com/proof-sunshine",
      invoiceUrl: "https://gwd-global.com/inv-104.pdf",
    },
  },
  {
    _id: "d105",
    clientName: "Amit Kumar",
    clientBusiness: "Quick Bite Cloud Kitchen",
    clientPhone: "+91 91234 56789",
    clientEmail: "amit@quickbite.in",
    serviceType: "Direct Ordering Website",
    dealValue: 12000,
    createdAt: "Day 2, 04:30 PM",
    status: "lead_cold",
    rejectionReason: "Client closed restaurant location or unresponsive to GWD follow-up calls.",
    dealArchitectId: { name: "Anil Kapoor", avatar: "AK", participantRole: "Developer" },
    teamId: { name: "Team Rocket (#3)", emoji: "⚡" },
    evidence: { interestSignalUrl: "https://email-proof.png" },
  },
];

export default function AdminDealsQueuePage() {
  const { toast } = useToast();
  const [deals, setDeals] = useState<any[]>(INITIAL_QUEUE);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all'|'pending'|'approved'|'rejected'|'flagged'>('pending');

  // Modals state
  const [closingDeal, setClosingDeal] = useState<any | null>(null);
  const [finalValue, setFinalValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Razorpay (Official GWD Link)");
  const [transactionId, setTransactionId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [assigningDeal, setAssigningDeal] = useState<any | null>(null);
  const [deliveryAssignment, setDeliveryAssignment] = useState<string>("participant_supervised");
  const [deliveryBriefUrl, setDeliveryBriefUrl] = useState("");

  const [coldDeal, setColdDeal] = useState<any | null>(null);
  const [coldReason, setColdReason] = useState("");

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch("/api/deals");
        if (res.ok) {
          const data = await res.json();
          if (data.deals && data.deals.length > 0) {
            setDeals(data.deals);
          }
        }
      } catch (err) {
        console.error("Failed to fetch deals:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  const handleUpdateAction = async (id: string, action: string, payload: any = {}) => {
    try {
      const res = await fetch(`/api/deals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminId: "CEO Pasha / Admin", ...payload }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDeals((prev) => prev.map((d) => (d._id === id ? { ...d, ...updated.deal } : d)));
        toast.success(`Deal status successfully updated to "${action.replace(/_/g, ' ')}"!`);
      } else {
        // Fallback local update for immediate UX responsiveness
        setDeals((prev) =>
          prev.map((d) => {
            if (d._id !== id) return d;
            if (action === "handoff_contact" || action === "gwd_contacted") return { ...d, status: "gwd_contacted" };
            if (action === "proposal_sent") return { ...d, status: "proposal_sent" };
            if (action === "gwd_close_paid") {
              const val = Number(payload.finalValue || d.dealValue || 0);
              const pts = 50 + Math.floor((val / 1000) * 0.5);
              return { ...d, status: "gwd_closed_paid", gwdFinalDealValue: val, pointsAwarded: pts };
            }
            if (action === "cold_lead") return { ...d, status: "lead_cold", rejectionReason: payload.rejectionReason };
            if (action === "assign_delivery") return { ...d, status: "delivery_assigned", deliveryAssignment: payload.deliveryAssignment, deliveryStatus: "in_progress" };
            if (action === "delivery_qa_pass") return { ...d, status: "delivery_qa_pass", deliveryQA: { ...d.deliveryQA, adminQaStatus: "approved" }, bonusPoints: (d.bonusPoints || 0) + 20 };
            return d;
          })
        );
        toast.info("Database offline: Update simulated locally.");
      }
    } catch (err) {
      console.error("Action error:", err);
      toast.error("Network error updating deal status.");
    }
  };

  const handleConfirmClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingDeal) return;
    await handleUpdateAction(closingDeal._id, "gwd_close_paid", {
      finalValue: Number(finalValue || closingDeal.dealValue),
      paymentMethod,
      transactionId,
      invoiceNumber,
    });
    setClosingDeal(null);
    setFinalValue("");
    setTransactionId("");
    setInvoiceNumber("");
  };

  const handleConfirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDeal) return;
    await handleUpdateAction(assigningDeal._id, "assign_delivery", {
      deliveryAssignment,
      deliveryBriefUrl,
    });
    setAssigningDeal(null);
    setDeliveryBriefUrl("");
  };

  const handleConfirmCold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coldDeal) return;
    await handleUpdateAction(coldDeal._id, "cold_lead", {
      rejectionReason: coldReason || "Lead unresponsive or not genuine.",
    });
    setColdDeal(null);
    setColdReason("");
  };

  // Filter deals by tabs
  const filteredDeals = deals.filter((d) => {
    const status = d.status || "admin_pending_contact";
    if (filterTab === "pending") return status === "admin_pending_contact";
    if (filterTab === "approved") return ["client_approved", "gwd_closed_paid"].includes(status);
    if (filterTab === "rejected") return ["rejected", "lead_cold"].includes(status);
    if (filterTab === "flagged") return Number(d.dealValue || 0) > 100000;
    return true; // 'all'
  });

  const isToday = (dateStr: string) => {
    if (!dateStr) return false;
    if (dateStr.startsWith('Day')) return true; // fallback for dummy data
    return new Date(dateStr).toDateString() === new Date().toDateString();
  };

  const pendingCount = deals.filter(d => d.status === 'admin_pending_contact').length;
  const approvedTodayCount = deals.filter(d => ['client_approved', 'gwd_closed_paid'].includes(d.status) && isToday(d.updatedAt || d.createdAt)).length;
  const rejectedTodayCount = deals.filter(d => ['rejected', 'lead_cold'].includes(d.status) && isToday(d.updatedAt || d.createdAt)).length;
  const avgDealValue = deals.length > 0 ? deals.reduce((acc, d) => acc + Number(d.gwdFinalDealValue || d.dealValue || 0), 0) / deals.length : 0;

  return (
    <DashboardLayout title="Admin Deal Verification & Sales Command" breadcrumbs={["Home", "Admin", "Deals Command"]}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-[var(--crimson)] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 animate-pulse" /> GWD Sales & Delivery Authority
            </span>
            <Badge variant="success" size="sm" className="font-mono shadow-2xs">Vault Protection On 🔒</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            5-Stage Lead Handoff & Payment Command
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1 max-w-2xl">
            Call vaulted client leads, send official Razorpay invoices, verify GWD payment receipt, and assign pre-client QA.
          </p>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2.5 min-h-[44px] border border-[var(--border)] rounded-xl text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-alt)] transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Pending Review"
          value={pendingCount.toString()}
          icon={Clock}
          className="border-orange-500/20 bg-orange-500/5"
        />
        <StatCard
          label="Approved Today"
          value={approvedTodayCount.toString()}
          icon={CheckCircle2}
          className="border-emerald-500/20 bg-emerald-500/5"
        />
        <StatCard
          label="Rejected Today"
          value={rejectedTodayCount.toString()}
          icon={XCircle}
          className="border-red-500/20 bg-red-500/5"
        />
        <StatCard
          label="Avg Deal Value"
          value={`₹${Math.round(avgDealValue).toLocaleString('en-IN')}`}
          icon={DollarSign}
          className="border-blue-500/20 bg-blue-500/5"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['pending', 'all', 'approved', 'rejected', 'flagged'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              filterTab === tab
                ? 'bg-[var(--crimson)] text-white'
                : 'bg-[var(--surface-alt)] text-[var(--text-secondary)] hover:bg-[var(--border)] border border-[var(--border)]'
            }`}
          >
            {tab} {tab === 'pending' ? `(${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {/* Deals List */}
      <div className="space-y-6 animate-slide-up">
        {filteredDeals.map((deal, index) => {
          const status = deal.status || "admin_pending_contact";
          return (
            <div
              key={deal._id}
              className="card-interactive p-6 bg-[var(--surface-card)] transition-all duration-300 shadow-sm"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Info & Vault Protected Contact */}
                <div className="flex-1 space-y-3.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-black font-mono text-[var(--crimson)] bg-[var(--surface-alt)] px-2.5 py-0.5 rounded-md border border-[var(--border)]">#{deal._id}</span>
                    <Badge variant={status === "gwd_closed_paid" || status === "approved" ? "success" : ["lead_cold", "rejected"].includes(status) ? "danger" : "warning"} size="sm" className="font-mono">
                      {status.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 bg-[var(--surface-alt)] px-2.5 py-1 rounded-full flex items-center gap-1">
                      {deal.teamId?.emoji || "⚡"} {deal.teamId?.name || "Squad Team"}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                      Originator: <strong>{deal.dealArchitectId?.name || "DA Member"}</strong> ({deal.dealArchitectId?.participantRole || "DA"})
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                        {deal.clientBusiness}
                      </h3>
                      <Link
                        href={`/admin/deals/${deal._id}/client`}
                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-emerald-500/20"
                      >
                        <Lock className="w-3 h-3" /> Open Client Vault & Log
                      </Link>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] font-medium mt-0.5">
                      Contact Person: <strong className="text-[var(--text-primary)]">{deal.clientName}</strong> &nbsp;•&nbsp; Service: <strong className="text-[var(--crimson)]">{deal.serviceType}</strong>
                    </p>
                  </div>

                  {/* Vaulted Contact Info Display (Only Admin sees real numbers!) */}
                  <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" /> Phone:{" "}
                        <code className="text-emerald-600 dark:text-emerald-400 font-mono text-sm bg-white dark:bg-black/40 px-2 py-0.5 rounded shadow-2xs">
                          {deal.clientPhone || "+91 98765 00000"}
                        </code>
                      </span>
                      {deal.clientEmail && (
                        <span className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                          <Mail className="w-3.5 h-3.5 text-blue-500" /> Email: <code>{deal.clientEmail}</code>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${deal.clientPhone || ""}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" /> Call Client Now
                      </a>
                      <a
                        href={`https://wa.me/${(deal.clientPhone || "").replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(deal.clientName)}%2C%20this%20is%20GWD%20Global%20Sales%20Team%20following%20up%20on%20your%20interest%20in%20${encodeURIComponent(deal.serviceType)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        WhatsApp Official
                      </a>
                    </div>
                  </div>

                  {/* Attached Evidence Grid */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mr-2">Attached Proof:</span>
                    {deal.evidence?.interestSignalUrl && (
                      <a
                        href={deal.evidence.interestSignalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-xs font-semibold hover:border-[var(--crimson)] text-[var(--text-primary)] flex items-center gap-1"
                      >
                        <Camera className="w-3 h-3 text-[var(--crimson)]" /> WhatsApp/Interest Proof <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}
                    {deal.evidence?.invoiceUrl && (
                      <a
                        href={deal.evidence.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-xs font-semibold hover:border-[var(--crimson)] text-[var(--text-primary)] flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-[var(--crimson)]" /> Proposal Doc <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}
                    {deal.evidence?.notes && (
                      <span className="text-xs text-[var(--text-secondary)] italic ml-2">
                        &quot;{deal.evidence.notes}&quot;
                      </span>
                    )}
                  </div>

                  {/* Delivery QA Preview if in Delivery Stage */}
                  {deal.deliveryQA?.participantDeliverableUrls && deal.deliveryQA.participantDeliverableUrls.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" /> Supervised Deliverables Ready for QA Review
                        </span>
                        <Badge variant={deal.deliveryQA.adminQaStatus === "approved" ? "success" : "warning"} size="sm">
                          {deal.deliveryQA.adminQaStatus === "approved" ? "QA Passed (+20 pts)" : "QA Pending"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {deal.deliveryQA.participantDeliverableUrls.map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-white dark:bg-black/40 border rounded-lg text-xs font-mono text-[var(--crimson)] hover:underline flex items-center gap-1">
                            🔗 {url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Values & Command Actions */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 gap-4 min-w-[240px]">
                  <div className="text-left lg:text-right">
                    <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Estimated / Closed Value</div>
                    <div className="text-2xl font-black text-[var(--crimson)]">
                      ₹{Number(deal.gwdFinalDealValue || deal.dealValue || 0).toLocaleString("en-IN")}
                    </div>
                    {status === "gwd_closed_paid" || status === "approved" ? (
                      <div className="text-xs font-bold text-[var(--success)] mt-0.5 flex items-center justify-end gap-1">
                        <Award className="w-3.5 h-3.5" /> +{deal.pointsAwarded || 67} pts Awarded
                      </div>
                    ) : (
                      <div className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
                        Will unlock: <strong className="text-[var(--crimson)]">+{50 + Math.floor(Number(deal.dealValue || 0) / 1000 * 0.5)} pts</strong>
                      </div>
                    )}
                  </div>

                  {/* Stage-based Action Buttons */}
                  <div className="flex flex-col gap-2 w-full lg:w-auto">
                    {/* If Stage 1: Mark Contacted */}
                    {["submitted", "admin_pending_contact"].includes(status) && (
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleUpdateAction(deal._id, "gwd_contacted")}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" /> Mark Client Contacted
                        </button>
                        <button
                          onClick={() => { setClosingDeal(deal); setFinalValue(String(deal.dealValue)); }}
                          className="px-4 py-2 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Confirm Payment & Close
                        </button>
                      </div>
                    )}

                    {/* If Stage 2/3: Confirm Payment */}
                    {["gwd_contacted", "proposal_sent", "negotiating"].includes(status) && (
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => { setClosingDeal(deal); setFinalValue(String(deal.dealValue)); }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Confirm GWD Paid & Award Points
                        </button>
                      </div>
                    )}

                    {/* If Stage 4 (Closed & Paid): Assign Delivery or QA */}
                    {(status === "gwd_closed_paid" || status === "approved") && (
                      <div className="flex flex-col gap-1.5">
                        {!deal.deliveryAssignment && (
                          <button
                            onClick={() => setAssigningDeal(deal)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <Briefcase className="w-3.5 h-3.5" /> Assign Delivery Squad
                          </button>
                        )}
                        {deal.deliveryQA?.adminQaStatus === "pending" && deal.deliveryQA?.participantDeliverableUrls?.length > 0 && (
                          <button
                            onClick={() => handleUpdateAction(deal._id, "delivery_qa_pass")}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Delivery QA (+20 pts)
                          </button>
                        )}
                      </div>
                    )}

                    {/* Cold Lead button for open deals */}
                    {!["gwd_closed_paid", "approved", "lead_cold", "rejected", "client_delivered", "client_approved"].includes(status) && (
                      <button
                        onClick={() => setColdDeal(deal)}
                        className="px-3 py-1.5 text-red-500 hover:bg-red-500/10 font-bold rounded-lg text-[11px] transition-colors text-center"
                      >
                        Mark Cold Lead (-5 pts)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDeals.length === 0 && (
          <div className="card p-12 text-center border border-dashed border-[var(--border)]">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-base text-[var(--text-primary)]">All clear in this queue</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">No deals currently match your selected status tab.</p>
          </div>
        )}
      </div>

      {/* ── MODAL: Confirm Payment & Close (Award Points!) ────────────────── */}
      {closingDeal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[var(--surface)] rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[var(--border)] animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-[var(--crimson)] font-bold text-sm mb-1 uppercase tracking-wider">
              <CreditCard className="w-4 h-4" /> Official GWD Revenue Confirmation
            </div>
            <h3 className="text-xl font-extrabold mb-2">
              Confirm Payment & Award Points: {closingDeal.clientBusiness}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Confirming this records GWD revenue and unlocks the originating participant&apos;s leaderboard score (+50 base + value bonus).
            </p>
            <form onSubmit={handleConfirmClose} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Final GWD Closed Value (₹) *</label>
                  <input
                    type="number"
                    required
                    value={finalValue}
                    onChange={(e) => setFinalValue(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-sm font-bold text-[var(--crimson)] focus:ring-2 focus:ring-[var(--crimson)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Payment Channel *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-xs bg-white dark:bg-black/40"
                  >
                    <option value="Razorpay (Official GWD Link)">Razorpay (Official GWD Account)</option>
                    <option value="Bank NEFT / IMPS to GWD">Bank NEFT / IMPS to GWD</option>
                    <option value="UPI Direct to GWD Global">UPI Direct to GWD Global</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Razorpay Transaction / Reference ID *</label>
                <input
                  type="text"
                  required
                  placeholder="pay_P1q2w3e4r5t6y7 or NEFT Ref #..."
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">GWD Invoice Number (Optional)</label>
                <input
                  type="text"
                  placeholder="GWD-INV-2026-104"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-xs"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 font-semibold flex items-center justify-between">
                <span>Leaderboard Points to Award right now:</span>
                <span className="text-base font-black">+{50 + Math.floor((Number(finalValue || 0) / 1000) * 0.5)} pts</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClosingDeal(null)}
                  className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold hover:bg-[var(--surface-alt)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm GWD Paid & Unlock Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Assign Delivery Squad ───────────────────────────────────── */}
      {assigningDeal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[var(--surface)] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[var(--border)] animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold mb-1">
              Assign Project Delivery: {assigningDeal.clientBusiness}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Who will execute the deliverables for this closed deal?
            </p>
            <form onSubmit={handleConfirmAssign} className="space-y-4">
              <div className="space-y-2">
                {[
                  { id: "participant_supervised", label: "Option B: Participant Supervised Delivery (Recommended)", hint: "Originating participant's squad delivers under GWD PM review." },
                  { id: "gwd_full", label: "Option A: GWD Internal Full Delivery", hint: "Complex/sensitive project handled 100% by internal GWD team." },
                  { id: "hybrid", label: "Option C: Hybrid Execution", hint: "GWD leads core architecture, squad assists on frontend/content." },
                ].map((opt) => (
                  <label key={opt.id} className={`block p-3 rounded-xl border cursor-pointer transition-all ${deliveryAssignment === opt.id ? "border-[var(--crimson)] bg-[var(--crimson-pale)]/40 font-semibold" : "border-[var(--border)] bg-[var(--surface-alt)]"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="assign" checked={deliveryAssignment === opt.id} onChange={() => setDeliveryAssignment(opt.id)} className="text-[var(--crimson)]" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">{opt.label}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] pl-5 mt-0.5">{opt.hint}</div>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Delivery Brief / Specification URL</label>
                <input
                  type="url"
                  placeholder="https://notion.so/gwd/brief-sunshine-dental"
                  value={deliveryBriefUrl}
                  onChange={(e) => setDeliveryBriefUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAssigningDeal(null)} className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold hover:bg-[var(--surface-alt)]">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-sm">
                  Confirm Delivery Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Cold Lead ───────────────────────────────────────────────── */}
      {coldDeal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[var(--surface)] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[var(--border)] animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-red-600 mb-1">
              Mark Lead Cold / Unqualified: {coldDeal.clientBusiness}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Enter reason why GWD could not close this lead. Applies small adjustment (-5 pts).
            </p>
            <form onSubmit={handleConfirmCold} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Reason / Client Status *</label>
                <textarea
                  required
                  rows={3}
                  value={coldReason}
                  onChange={(e) => setColdReason(e.target.value)}
                  placeholder="e.g., Client phone unreachable or not genuinely looking for website at this time."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setColdDeal(null)} className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold hover:bg-[var(--surface-alt)]">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-sm">
                  Mark Cold Lead (-5 pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
