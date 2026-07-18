"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import {
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Camera,
  FileText,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const SERVICE_TYPES = [
  "Landing Page",
  "Business Website (3-5 pages)",
  "E-commerce Store",
  "Social Media Management",
  "Google My Business + SEO",
  "Logo & Brand Identity",
  "WhatsApp Business Setup",
  "Monthly Maintenance",
  "Custom Web Application / AI Tool",
  "Other",
];

export default function NewDealPage() {
  const router = useRouter();
  const { user } = useUserRole();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    clientName: "",
    clientBusiness: "",
    clientPhone: "",
    clientEmail: "",
    serviceType: "",
    dealValue: "",
    evidenceInterestSignal: "",
    meetingNotesUrl: "",
    voiceNoteUrl: "",
    evidenceInvoice: "",
    notes: "",
  });

  const packageRecommendation = useMemo(() => {
    if (form.serviceType === "Landing Page" || form.serviceType === "Google My Business + SEO") {
      return { pkg: "GWD Package A", price: "₹8,000", delivery: "2 days", desc: "Single-page landing + Google My Business verification" };
    }
    if (form.serviceType === "Business Website (3-5 pages)" || form.serviceType === "Logo & Brand Identity") {
      return { pkg: "GWD Package B", price: "₹15,000", delivery: "5 days", desc: "3-5 page business site + basic SEO optimization" };
    }
    if (form.serviceType === "E-commerce Store") {
      return { pkg: "GWD Package C", price: "₹30,000", delivery: "10 days", desc: "Full online store + shopping cart + Razorpay checkout integration" };
    }
    return null;
  }, [form.serviceType]);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.clientName,
          clientBusiness: form.clientBusiness,
          clientPhone: form.clientPhone,
          clientEmail: form.clientEmail,
          serviceType: form.serviceType,
          dealValue: form.dealValue || "15000",
          participantEstimatedValue: form.dealValue || "15000",
          evidence: {
            interestSignalUrl: form.evidenceInterestSignal,
            meetingNotesUrl: form.meetingNotesUrl,
            voiceNoteUrl: form.voiceNoteUrl,
            invoiceUrl: form.evidenceInvoice,
            notes: form.notes,
          },
          notes: form.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit interest signal");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout title="Signal Submitted" breadcrumbs={["Home", "Deals", "New Signal"]}>
        <div className="max-w-lg mx-auto mt-12">
          <div className="card p-10 text-center border-2 border-[var(--success)]/30">
            <div className="w-16 h-16 rounded-full bg-[var(--success-pale)] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Lead Handoff Queued! 🎉
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              <strong>{form.clientBusiness}</strong> ({form.clientName}) — {form.serviceType}
            </p>
            <div className="p-4 bg-[var(--surface-alt)] rounded-xl text-left text-xs space-y-2 mb-6 border border-[var(--border)]">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                <ShieldCheck className="w-4 h-4 text-[var(--crimson)] shrink-0" />
                What happens right now?
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                1. You earned <strong className="text-[var(--crimson)]">+10 points</strong> instantly for lead origination.
                <br />
                2. GWD Sales has received verified contact info and will call {form.clientName} within 24 hours.
                <br />
                3. Once GWD officially signs the proposal and confirms payment, your full <strong className="text-[var(--crimson)]">deal points (+50 base + bonus)</strong> will unlock automatically!
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setStep(1);
                  setForm({
                    clientName: "",
                    clientBusiness: "",
                    clientPhone: "",
                    clientEmail: "",
                    serviceType: "",
                    dealValue: "",
                    evidenceInterestSignal: "",
                    meetingNotesUrl: "",
                    voiceNoteUrl: "",
                    evidenceInvoice: "",
                    notes: "",
                  });
                }}
                className="px-5 py-2.5 border border-[var(--border)] rounded-lg text-sm font-semibold hover:bg-[var(--surface-alt)] transition-colors"
              >
                Submit Another Lead
              </button>
              <button
                onClick={() => router.push("/deals")}
                className="px-5 py-2.5 bg-[var(--crimson)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--crimson-dark)] transition-colors"
              >
                View Pipeline Tracker
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Submit Client Interest Signal" breadcrumbs={["Home", "Deals", "New Signal"]}>
      <div className="max-w-3xl mx-auto animate-slide-up">
        {/* ═══ HOW IT WORKS EXPLANATION BANNER ═══ */}
        <div className="mb-8 p-6 rounded-2xl bg-[var(--surface-glass)] backdrop-blur-xl border border-[var(--border)] shadow-md transition-all hover:shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[var(--crimson-pale)] flex items-center justify-center shrink-0 shadow-2xs animate-float">
              <Sparkles className="w-5 h-5 text-[var(--crimson)]" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[var(--text-primary)] mb-1 flex flex-wrap items-center gap-2 font-display">
                GWD Deal Handoff & Payment Protection Pipeline
                <Badge variant="default" size="sm" className="font-mono px-2 py-0.5 shadow-2xs">Official Model</Badge>
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                As a Deal Architect in the Orbit Simulator, your role is to <strong className="text-[var(--text-primary)]">prospect, pitch, and generate strong client interest</strong>. Once a client is interested, submit their details below to hand them off to <strong className="text-[var(--text-primary)]">GWD Global&apos;s official sales team</strong> for contract signature and payment collection.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-[var(--border)] shadow-2xs transition-transform hover:-translate-y-0.5">
                  <strong className="block text-[var(--crimson)] mb-1 font-mono tracking-tight text-xs">1. ORIGINATE (+10 pts)</strong>
                  Pitch client & attach proof of interest/WhatsApp chat.
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-[var(--border)] shadow-2xs transition-transform hover:-translate-y-0.5">
                  <strong className="block text-[var(--crimson)] mb-1 font-mono tracking-tight text-xs">2. GWD CLOSES</strong>
                  GWD sends official invoice. Payment hits GWD accounts safely.
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-[var(--border)] shadow-2xs transition-transform hover:-translate-y-0.5">
                  <strong className="block text-[var(--crimson)] mb-1 font-mono tracking-tight text-xs">3. POINTS & DELIVERY</strong>
                  Full points (+50+ bonus). Qualified teams can be assigned supervised delivery!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          {[
            { n: 1, label: "1. Client & Estimate" },
            { n: 2, label: "2. Interest Evidence" },
            { n: 3, label: "3. Confirm Handoff" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 sm:gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-mono transition-all duration-300 shadow-2xs ${
                  step >= s.n ? "bg-[var(--crimson)] text-white scale-105" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]"
                }`}
              >
                {step > s.n ? <CheckCircle2 className="w-5 h-5 animate-scale-up" /> : s.n}
              </div>
              <span className={`text-xs sm:text-sm hidden sm:inline ${step >= s.n ? "text-[var(--text-primary)] font-bold tracking-tight" : "text-[var(--text-muted)] font-medium"}`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`w-6 sm:w-10 h-0.5 rounded-full transition-colors duration-300 ${step > s.n ? "bg-[var(--crimson)]" : "bg-[var(--border)]"}`} />
              )}
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500 text-red-500 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="card p-8">
          {/* ═══ STEP 1: Client Info & Estimate ═══ */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--crimson)]" />
                Client Profile & Pitch Details
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-6">
                Enter accurate client details so the GWD Sales team can initiate official follow-up immediately.
              </p>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Business / Clinic / Brand Name *</label>
                    <input
                      type="text"
                      value={form.clientBusiness}
                      onChange={(e) => update("clientBusiness", e.target.value)}
                      placeholder="e.g., Sunshine Dental Care"
                      className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Contact Person (Decision Maker) *</label>
                    <input
                      type="text"
                      value={form.clientName}
                      onChange={(e) => update("clientName", e.target.value)}
                      placeholder="e.g., Dr. Rajesh Sharma"
                      className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                    />
                  </div>
                </div>

                {/* Secure Contact Box */}
                <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Client Contact Info (Vault Protected)
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-medium">
                      Admin-Only After Submission
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    To protect client privacy and ensure official GWD billing compliance, this contact info is vaulted exclusively for GWD Sales Lead calling.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Client Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={form.clientPhone}
                        onChange={(e) => update("clientPhone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-white dark:bg-black/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Client Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={form.clientEmail}
                        onChange={(e) => update("clientEmail", e.target.value)}
                        placeholder="doctor@sunshinedental.com"
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-white dark:bg-black/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Service Pitched *</label>
                    <select
                      value={form.serviceType}
                      onChange={(e) => update("serviceType", e.target.value)}
                      className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-white dark:bg-black/40"
                    >
                      <option value="">Select service type</option>
                      {SERVICE_TYPES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Estimated Quote Pitched (₹) *</label>
                    <input
                      type="number"
                      value={form.dealValue}
                      onChange={(e) => update("dealValue", e.target.value)}
                      placeholder="15000"
                      min="1000"
                      className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                    />
                  </div>
                </div>
                {packageRecommendation && (
                  <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/15 text-xs text-[var(--text-secondary)] space-y-1 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">💡 Standard {packageRecommendation.pkg} Suggestion:</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">{packageRecommendation.price} · {packageRecommendation.delivery} Delivery</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)]">{packageRecommendation.desc}</p>
                  </div>
                )}
                {form.dealValue && (
                  <div className="p-3 bg-[var(--crimson-pale)]/50 rounded-lg border border-[var(--crimson)]/20 text-xs text-[var(--text-secondary)] flex items-center justify-between">
                    <span>Expected Leaderboard Points upon GWD Payment Closure:</span>
                    <strong className="text-[var(--crimson)] text-sm">
                      +{50 + Math.floor(parseInt(form.dealValue || "0") / 1000 * 0.5)} pts
                    </strong>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.clientBusiness || !form.clientName || !form.clientPhone || !form.serviceType || !form.dealValue}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--crimson)] text-white font-semibold rounded-lg hover:bg-[var(--crimson-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next: Proof of Interest <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* ═══ STEP 2: Evidence & Notes ═══ */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[var(--crimson)]" />
                Proof of Client Interest
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-6">
                Provide clear evidence that the client expressed genuine interest in this service. This enables GWD Sales to reference your discussion during the closing call.
              </p>

              <div className="space-y-5">
                {[
                  {
                    key: "evidenceInterestSignal",
                    icon: Camera,
                    label: "WhatsApp / Email Screenshot of Client Interest *",
                    hint: "Screenshot showing the client asking for a proposal, agreeing to pricing, or requesting GWD follow-up",
                    required: true,
                  },
                  {
                    key: "meetingNotesUrl",
                    icon: FileText,
                    label: "Meeting / Pitch Notes Link (Optional)",
                    hint: "Google Doc, Notion link, or summary of client requirements & pain points",
                  },
                  {
                    key: "voiceNoteUrl",
                    icon: Upload,
                    label: "Call Recording / Voice Summary URL (Optional)",
                    hint: "Drive/Dropbox link to any audio recording or brief summary for GWD Sales Lead",
                  },
                  {
                    key: "evidenceInvoice",
                    icon: FileText,
                    label: "Draft Proposal / Presentation Sent (Optional)",
                    hint: "Link to the pitch deck or pricing estimate shown during your meeting",
                  },
                ].map((field) => (
                  <div key={field.key} className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--crimson)]/50 transition-colors bg-[var(--surface-alt)]/40">
                    <div className="flex items-center gap-2 mb-1.5">
                      <field.icon className="w-4 h-4 text-[var(--crimson)]" />
                      <span className="text-sm font-semibold">{field.label}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mb-3">{field.hint}</p>
                    <input
                      type="text"
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => update(field.key, e.target.value)}
                      placeholder="Paste URL (e.g., https://...)"
                      className="w-full px-3.5 py-2 border border-[var(--border)] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-white dark:bg-black/40"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium mb-1.5">Briefing Notes for GWD Sales Lead *</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="E.g., Dr. Rajesh wants his clinic site live before Aug 1st. He loves dark theme designs and is ready to sign once GWD sends the formal Razorpay invoice."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] rounded-lg text-sm font-semibold hover:bg-[var(--surface-alt)] transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.evidenceInterestSignal}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--crimson)] text-white font-semibold rounded-lg hover:bg-[var(--crimson-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next: Review & Submit <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* ═══ STEP 3: Review & Submit ═══ */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Confirm Lead Handoff to GWD Sales
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-6">
                Please verify details before queuing for official GWD verification and contact.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 font-semibold">Client & Business</div>
                  <div className="font-bold text-base text-[var(--text-primary)]">{form.clientBusiness}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-3">
                    <span>Contact: {form.clientName}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">🔒 Phone: {form.clientPhone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 font-semibold">Service Pitched</div>
                    <div className="font-semibold text-sm text-[var(--text-primary)]">{form.serviceType}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 font-semibold">Estimated Quote</div>
                    <div className="font-bold text-base text-[var(--crimson)]">₹{parseInt(form.dealValue || "0").toLocaleString("en-IN")}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--crimson-pale)] border border-[var(--crimson)]/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[var(--crimson)] font-bold uppercase tracking-wider">Leaderboard Points Reward</div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">+10 instant submission + full points when GWD confirms payment</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-2xl text-[var(--crimson)]">
                      +{50 + Math.floor(parseInt(form.dealValue || "0") / 1000 * 0.5)} pts
                    </div>
                  </div>
                </div>

                {form.notes && (
                  <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 font-semibold">Sales Briefing Notes</div>
                    <p className="text-xs text-[var(--text-secondary)] italic">&quot;{form.notes}&quot;</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] rounded-lg text-sm font-semibold hover:bg-[var(--surface-alt)] transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-7 py-3 bg-[var(--crimson)] text-white font-bold rounded-xl hover:bg-[var(--crimson-dark)] transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Submit to GWD Sales Queue <CheckCircle2 className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
