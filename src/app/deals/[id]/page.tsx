"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import {
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  CreditCard,
  MessageSquare,
  Camera,
  ExternalLink,
  Shield,
  Upload,
  User,
  Check,
  Building2,
  Phone,
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { PageLoadingSpinner } from "@/components/ui/Skeleton";

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { role: userRole } = useUserRole();
  const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) || "d101";

  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [deliverableNote, setDeliverableNote] = useState("");
  const [qaFeedbackMsg, setQaFeedbackMsg] = useState("");

  useEffect(() => {
    async function fetchDeal() {
      try {
        const res = await fetch(`/api/deals/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDeal(data.deal);
        } else {
          // Fallback demo deal formatted in 5-stage model
          setDeal({
            _id: id,
            clientName: "Dr. Sharma",
            clientBusiness: "Sunshine Dental Clinic",
            clientPhone: "••• hidden by GWD Sales •••",
            clientEmail: "••• hidden by GWD Sales •••",
            serviceType: "Appointment Booking Engine + SEO",
            dealValue: 35000,
            gwdFinalDealValue: 35000,
            status: "gwd_closed_paid",
            pointsAwarded: 67,
            bonusPoints: 20,
            deliveryAssignment: "participant_supervised",
            deliveryStatus: "in_progress",
            evidence: {
              interestSignalUrl: "https://whatsapp.com/sample-chat-proof",
              invoiceUrl: "https://gwd-global.com/proposals/sunshine-104.pdf",
              notes: "Client needed urgent live booking calendar before month end.",
            },
            deliveryQA: {
              adminQaStatus: "pending",
              participantDeliverableUrls: ["https://sunshine-dental-preview.vercel.app"],
            },
            dealArchitectId: { name: "Arjun Reddy", avatar: "AR", participantRole: "Deal Architect" },
            projectManagerId: { name: "Sneha Patel", avatar: "SP" },
            teamId: { name: "Titan V", emoji: "🚀" },
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error fetching deal:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeal();
  }, [id]);

  const handleAddDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl) return;

    // Local state update for immediate UX
    const updatedUrls = [...(deal?.deliveryQA?.participantDeliverableUrls || []), deliverableUrl];
    setDeal((prev: any) => ({
      ...prev,
      deliveryQA: {
        ...(prev.deliveryQA || {}),
        participantDeliverableUrls: updatedUrls,
        adminQaStatus: "pending",
      },
    }));
    setShowUploadModal(false);
    setDeliverableUrl("");
    setDeliverableNote("");
  };

  if (loading) {
    return (
      <DashboardLayout title="Deal Tracker" breadcrumbs={["Home", "Deals", `#${id}`]}>
        <PageLoadingSpinner message="Loading pipeline tracker details..." />
      </DashboardLayout>
    );
  }

  if (!deal) {
    return (
      <DashboardLayout title="Deal Not Found" breadcrumbs={["Home", "Deals", `#${id}`]}>
        <div className="card p-12 text-center max-w-md mx-auto my-12">
          <AlertCircle className="w-12 h-12 text-[var(--warning)] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Deal Not Found</h2>
          <p className="text-xs text-[var(--text-secondary)] mb-6">
            This deal record may have been moved or you do not have permission to access it.
          </p>
          <Link href="/deals" className="px-5 py-2.5 bg-[var(--crimson)] text-white font-semibold rounded-xl text-xs">
            Back to Pipeline
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Determine stage flags
  const status = deal.status || "admin_pending_contact";
  const isContacted = ["gwd_contacted", "proposal_sent", "negotiating", "gwd_closed_paid", "delivery_assigned", "delivery_qa_pass", "client_delivered", "client_approved", "approved"].includes(status);
  const isProposal = ["proposal_sent", "negotiating", "gwd_closed_paid", "delivery_assigned", "delivery_qa_pass", "client_delivered", "client_approved", "approved"].includes(status);
  const isClosedPaid = ["gwd_closed_paid", "delivery_assigned", "delivery_qa_pass", "client_delivered", "client_approved", "approved"].includes(status);
  const isDeliveryAssigned = ["delivery_assigned", "delivery_qa_pass", "client_delivered", "client_approved", "in_progress", "delivered"].includes(status) || deal.deliveryAssignment;
  const isQaPass = ["delivery_qa_pass", "client_delivered", "client_approved"].includes(status) || deal.deliveryQA?.adminQaStatus === "approved";
  const isClientApproved = ["client_approved"].includes(status);
  const isColdLead = ["lead_cold", "rejected"].includes(status);

  return (
    <DashboardLayout title={`Deal Tracker — ${deal.clientBusiness}`} breadcrumbs={["Home", "Deals", `#${id}`]}>
      <div className="animate-slide-up">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            href="/deals"
            className="flex items-center gap-2 min-h-[44px] text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--crimson)] transition-colors active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Pipeline
          </Link>
          <div className="flex items-center gap-3">
            {isClosedPaid ? (
              <Badge variant="success" size="md" className="font-mono shadow-2xs">Stage 4: GWD Closed & Paid ✓</Badge>
            ) : isContacted ? (
              <Badge variant="default" size="md" className="font-mono shadow-2xs">Stage 2/3: GWD Active Follow-up 📞</Badge>
            ) : isColdLead ? (
              <Badge variant="warning" size="md" className="font-mono shadow-2xs">Lead Unqualified / Cold ❌</Badge>
            ) : (
              <Badge variant="outline" size="md" className="font-mono shadow-2xs">Stage 1: Queued for GWD Sales ⏳</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Deal Info & 5-Stage Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Deal Summary Card */}
            <div className="card-glass p-6 border border-[var(--border)] shadow-md relative overflow-hidden transition-all hover:shadow-lg">
              {/* Vault Protection Banner */}
              <div className="mb-5 py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="flex items-center gap-2 font-bold text-sm">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Client Vault Protection Active
                </span>
                <span className="text-[11px] opacity-90">
                  Direct contact locked to GWD Admin to ensure 100% company billing oversight.
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
                <div>
                  <span className="text-xs font-black text-[var(--crimson)] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Building2 className="w-4 h-4" /> {deal.teamId?.name || "Team Squad"} • Lead Handoff
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-1.5 font-display tracking-tight">
                    {deal.clientBusiness}
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">
                    <strong className="text-[var(--text-primary)]">Contact:</strong> {deal.clientName} &nbsp;•&nbsp; <strong className="text-[var(--text-primary)]">Service:</strong> {deal.serviceType}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[var(--text-secondary)]" /> Phone: <code className="bg-[var(--surface-alt)] px-2 py-0.5 rounded-md text-emerald-600 dark:text-emerald-400 font-mono font-bold">{deal.clientPhone || "••• hidden by GWD Sales •••"}</code>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[var(--text-secondary)]" /> Email: <code className="bg-[var(--surface-alt)] px-2 py-0.5 rounded-md text-emerald-600 dark:text-emerald-400 font-mono font-bold">{deal.clientEmail || "••• hidden •••"}</code>
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-right bg-[var(--surface-alt)] p-4 rounded-xl border border-[var(--border)] shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Official GWD Closed Value</div>
                  <div className="text-2xl sm:text-3xl font-black text-[var(--crimson)] font-mono tracking-tight mt-0.5">
                    ₹{Number(deal.gwdFinalDealValue || deal.dealValue || 0).toLocaleString("en-IN")}
                  </div>
                  {isClosedPaid ? (
                    <div className="text-xs font-bold text-[var(--success)] mt-1.5 flex items-center gap-1 justify-start md:justify-end font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-scale-up" /> +{deal.pointsAwarded || 67} Orbit Points Awarded
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-[var(--text-muted)] mt-1.5">
                      Expected Points: <strong className="text-[var(--crimson)] font-mono">+{50 + Math.floor(Number(deal.dealValue || 0) / 1000 * 0.5)} pts</strong> on payment
                    </div>
                  )}
                </div>
              </div>

            {/* Evidence & Handoff Notes */}
            <div className="pt-6">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--crimson)]" /> Attached Lead Evidence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deal.evidence?.interestSignalUrl && (
                  <a
                    href={deal.evidence.interestSignalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--crimson)] bg-[var(--surface-alt)] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Camera className="w-4 h-4 text-[var(--crimson)]" />
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">WhatsApp / Interest Screenshot</div>
                        <div className="text-[10px] text-[var(--success)] font-semibold">Attached by DA ✓</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--crimson)]" />
                  </a>
                )}
                {deal.evidence?.invoiceUrl && (
                  <a
                    href={deal.evidence.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--crimson)] bg-[var(--surface-alt)] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[var(--crimson)]" />
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">Proposal Document / Invoice</div>
                        <div className="text-[10px] text-[var(--success)] font-semibold">Official Doc ✓</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--crimson)]" />
                  </a>
                )}
              </div>
              {deal.evidence?.notes && (
                <div className="mt-4 p-3.5 rounded-xl bg-[var(--surface-alt)]/60 border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                  <strong className="block text-[var(--text-primary)] mb-1">DA Briefing Notes for GWD Sales:</strong>
                  &quot;{deal.evidence.notes}&quot;
                </div>
              )}
            </div>
          </div>

          {/* ═══ 5-STAGE PIPELINE TIMELINE TRACKER ═══ */}
          <div className="card p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">
                  5-Stage GWD Pipeline & Delivery Tracker
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Track exact milestones from participant prospecting to official GWD payment closure and QA.
                </p>
              </div>
              {isClosedPaid && deal.deliveryAssignment === "participant_supervised" && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Supervised Deliverable
                </button>
              )}
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--border)]">
              {/* Stage 1 */}
              <div className="relative flex items-start justify-between">
                <div className="absolute -left-[23px] w-6 h-6 rounded-full bg-[var(--success)] border-2 border-[var(--success)] text-white flex items-center justify-center text-xs font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex-1 pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Stage 1: Participant Submitted Interest Signal</span>
                    <span className="text-[11px] text-[var(--success)] font-semibold">Completed (+10 pts)</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Originated by {deal.dealArchitectId?.name || "DA Squad Member"}. Contact details vaulted for GWD verification.
                  </p>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="relative flex items-start justify-between">
                <div
                  className={`absolute -left-[23px] w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    isContacted
                      ? "bg-[var(--success)] border-[var(--success)] text-white"
                      : "bg-white dark:bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  {isContacted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "2"}
                </div>
                <div className="flex-1 pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Stage 2: GWD Sales Contacted Client</span>
                    <span className={`text-[11px] font-semibold ${isContacted ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`}>
                      {isContacted ? "Contacted ✓" : "In Queue ⏳"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    GWD Sales Lead verified genuine client interest via phone/email and discussed pricing.
                  </p>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="relative flex items-start justify-between">
                <div
                  className={`absolute -left-[23px] w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    isProposal
                      ? "bg-[var(--success)] border-[var(--success)] text-white"
                      : "bg-white dark:bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  {isProposal ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "3"}
                </div>
                <div className="flex-1 pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Stage 3: Official GWD Proposal Sent & Negotiating</span>
                    <span className={`text-[11px] font-semibold ${isProposal ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`}>
                      {isProposal ? "Proposal Active ✓" : "Pending"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Formal GWD Global letterhead proposal & scope sent to decision maker.
                  </p>
                </div>
              </div>

              {/* Stage 4 */}
              <div className="relative flex items-start justify-between">
                <div
                  className={`absolute -left-[23px] w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    isClosedPaid
                      ? "bg-[var(--crimson)] border-[var(--crimson)] text-white shadow-md"
                      : "bg-white dark:bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  {isClosedPaid ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "4"}
                </div>
                <div className="flex-1 pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Stage 4: GWD Closed & Collected Payment</span>
                    <span className={`text-[11px] font-bold ${isClosedPaid ? "text-[var(--crimson)]" : "text-[var(--text-muted)]"}`}>
                      {isClosedPaid ? `Paid to GWD (+${deal.pointsAwarded || 67} pts) 🎉` : "Awaiting Client Payment"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Contract signed and payment verified into official GWD bank/Razorpay accounts. Triggered full leaderboard points!
                  </p>
                </div>
              </div>

              {/* Stage 5 */}
              <div className="relative flex items-start justify-between">
                <div
                  className={`absolute -left-[23px] w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    isQaPass
                      ? "bg-[var(--success)] border-[var(--success)] text-white"
                      : isDeliveryAssigned
                      ? "bg-[var(--warning)] border-[var(--warning)] text-white animate-pulse"
                      : "bg-white dark:bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  {isQaPass ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "5"}
                </div>
                <div className="flex-1 pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Stage 5: Delivery Assignment & Pre-Client QA</span>
                    <span className={`text-[11px] font-semibold ${isQaPass ? "text-[var(--success)]" : isDeliveryAssigned ? "text-[var(--warning)]" : "text-[var(--text-muted)]"}`}>
                      {isQaPass ? "QA Passed (+20 pts) ✓" : isDeliveryAssigned ? "Supervised Delivery Active 🛠️" : "Pending Stage 4"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {deal.deliveryAssignment === "gwd_full"
                      ? "GWD internal team handling 100% of delivery."
                      : deal.deliveryAssignment === "participant_supervised"
                      ? "Assigned to your squad under GWD PM oversight. All deliverables reviewed by admin before client presentation."
                      : "Hybrid execution with GWD & Participant squad."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Scoring Breakdown & Squad */}
        <div className="space-y-6">
          {/* Points Breakdown */}
          <div className="card p-5 border border-[var(--border)] shadow-sm bg-[var(--crimson-pale)]/50">
            <h3 className="font-bold text-sm text-[var(--crimson)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Orbit Point Calculation
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between font-medium">
                <span>Lead Origination (Stage 1)</span>
                <span className="font-bold text-[var(--success)]">+10 pts</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Base Deal Closure Bonus</span>
                <span className="font-bold">+50 pts</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Value Bonus (₹{Number(deal.gwdFinalDealValue || deal.dealValue || 0).toLocaleString()} / 1000 × 0.5)</span>
                <span className="font-bold">+{Math.floor(Number(deal.gwdFinalDealValue || deal.dealValue || 0) / 1000 * 0.5)} pts</span>
              </div>
              {deal.bonusPoints > 0 && (
                <div className="flex justify-between font-medium text-emerald-600">
                  <span>Delivery QA / 5-Star Sign-off Bonus</span>
                  <span className="font-bold">+{deal.bonusPoints} pts</span>
                </div>
              )}
              <div className="pt-2 border-t border-[var(--crimson)]/20 flex justify-between text-sm font-black text-[var(--crimson)]">
                <span>Total Points Earned</span>
                <span>+{10 + 50 + Math.floor(Number(deal.gwdFinalDealValue || deal.dealValue || 0) / 1000 * 0.5) + (deal.bonusPoints || 0)} pts</span>
              </div>
            </div>
          </div>

          {/* Delivery QA Status Card if Participant Supervised */}
          {deal.deliveryAssignment === "participant_supervised" && (
            <div className="card p-5 border border-[var(--border)] shadow-sm">
              <h3 className="font-bold text-sm mb-2 flex items-center justify-between">
                <span>Supervised Delivery QA</span>
                <Badge variant={deal.deliveryQA?.adminQaStatus === "approved" ? "success" : "warning"} size="sm">
                  {deal.deliveryQA?.adminQaStatus === "approved" ? "QA Passed ✓" : "Review Pending"}
                </Badge>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                Deliverables submitted here are checked by GWD PM before client delivery.
              </p>
              {deal.deliveryQA?.participantDeliverableUrls && deal.deliveryQA.participantDeliverableUrls.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {deal.deliveryQA.participantDeliverableUrls.map((url: string, idx: number) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded bg-[var(--surface-alt)] text-xs text-[var(--crimson)] font-mono truncate hover:underline"
                    >
                      🔗 {url}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded bg-[var(--surface-alt)] text-xs text-[var(--text-muted)] text-center mb-3">
                  No deliverables uploaded yet
                </div>
              )}
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full py-2 border border-[var(--border)] rounded-xl text-xs font-semibold hover:bg-[var(--surface-alt)] transition-colors"
              >
                + Add Deliverable URL
              </button>
            </div>
          )}

          {/* Assigned Squad */}
          <div className="card p-5 border border-[var(--border)] shadow-sm">
            <h3 className="font-bold text-sm mb-3">Assigned Squad Members</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--dark)] text-white text-xs font-bold flex items-center justify-center">
                  {deal.dealArchitectId?.avatar || "DA"}
                </div>
                <div>
                  <div className="text-xs font-bold">{deal.dealArchitectId?.name || "Deal Architect"}</div>
                  <div className="text-[10px] text-[var(--crimson)] font-semibold">Originator / DA</div>
                </div>
              </div>
              {deal.projectManagerId && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--dark)] text-white text-xs font-bold flex items-center justify-center">
                    {deal.projectManagerId.avatar || "PM"}
                  </div>
                  <div>
                    <div className="text-xs font-bold">{deal.projectManagerId.name}</div>
                    <div className="text-[10px] text-[var(--crimson)] font-semibold">GWD Squad PM</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[var(--surface)] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[var(--border)] animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold mb-2">
              Upload Supervised Deliverable
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Enter preview URL or file link. GWD Admin will run internal Pre-Delivery QA before sending to the client.
            </p>
            <form onSubmit={handleAddDeliverable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Deliverable Preview URL *</label>
                <input
                  type="url"
                  required
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  placeholder="https://sunshine-preview.vercel.app"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Brief Note for Admin QA</label>
                <input
                  type="text"
                  value={deliverableNote}
                  onChange={(e) => setDeliverableNote(e.target.value)}
                  placeholder="e.g., Completed booking UI & responsive layout"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold hover:bg-[var(--surface-alt)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--crimson)] text-white rounded-xl text-xs font-semibold hover:bg-[var(--crimson-dark)] shadow-sm"
                >
                  Submit for Admin QA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
