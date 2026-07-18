"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sparkles,
  Building2,
  Phone,
  Mail,
  MapPin,
  Target,
  Briefcase,
  Loader2,
  AlertCircle,
  RefreshCw,
  MessageCircle,
} from "lucide-react";

interface Lead {
  _id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  city?: string;
  gapAnalysis?: string;
  suggestedPitch?: string;
  estimatedValue?: number;
  status: string;
  assignedTeamId?: string;
}

interface NicheInfo {
  name: string;
  emoji: string;
  description: string;
}

// Niche metadata by slug — displayed when niche name is known
const NICHE_META: Record<string, NicheInfo> = {
  healthcare: {
    name: "Healthcare & Dental Clinics",
    emoji: "🏥",
    description:
      "Your squad is locked into the healthcare vertical. Medical clinics have high ticket budgets but severe digital gaps. Pitch high-conversion booking engines, automated review generators, and modern responsive websites.",
  },
  "food-and-beverage": {
    name: "Food & Beverage",
    emoji: "🍽️",
    description:
      "Restaurants, cloud kitchens, and QSR chains dominate this niche. Focus on online ordering systems, Zomato/Swiggy alternatives, and loyalty apps.",
  },
  "real-estate": {
    name: "Real Estate & Property",
    emoji: "🏢",
    description:
      "Property developers and agents need 3D virtual tours, automated lead capture, and digital property showcases. High-ticket deals with long sales cycles.",
  },
  education: {
    name: "Education & EdTech",
    emoji: "📚",
    description:
      "Coaching institutes and online educators need LMS portals, batch management systems, and parent-facing communication dashboards.",
  },
};

export default function NicheRevealPage() {
  const { role: userRole, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <DashboardLayout title="Niche & Lead Reveal" breadcrumbs={["Home", "Niche Assignment"]}>
        <div className="flex items-center justify-center py-20 text-sm text-[var(--text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin mr-3 text-[var(--crimson)]" />
          Loading leads...
        </div>
      </DashboardLayout>
    );
  }

  if (userRole !== 'participant') {
    return (
      <DashboardLayout title="Niche & Lead Reveal" breadcrumbs={['Home', 'Niche Assignment']}>
        <div className="flex flex-col items-center justify-center text-center p-12 min-h-[60vh]">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <Target className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-3">Participant Access Only</h2>
          <p className="text-[var(--text-secondary)] max-w-md">Lead assignment and niche boards are only accessible to registered simulation participants. Admins can manage niches from the Participant Directory.</p>
        </div>
      </DashboardLayout>
    );
  }

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState("");
  const [openBriefId, setOpenBriefId] = useState<string | null>(null);

  // Try to detect niche from the first lead (they share a nicheId)
  const [nicheInfo, setNicheInfo] = useState<NicheInfo | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/niche/leads");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load leads");
      setLeads(data.leads ?? []);

      // If leads have a populated niche name, use it
      if (data.nicheName) {
        const key = data.nicheName.toLowerCase().replace(/\s+/g, "-");
        setNicheInfo(NICHE_META[key] ?? { name: data.nicheName, emoji: "🎯", description: "" });
      } else {
        // Default fallback if no niche meta available
        setNicheInfo(NICHE_META["healthcare"]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleClaim = async (leadId: string) => {
    setClaimingId(leadId);
    setClaimError("");
    try {
      const res = await fetch("/api/niche/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Claim failed");

      // Refresh leads list to show updated claim status
      await fetchLeads();
    } catch (err: unknown) {
      setClaimError(err instanceof Error ? err.message : "Failed to claim lead");
    } finally {
      setClaimingId(null);
    }
  };

  const claimedCount = leads.filter((l) => l.status === "claimed").length;

  if (loading) {
    return (
      <DashboardLayout title="Niche & Lead Reveal" breadcrumbs={["Home", "Niche Assignment"]}>
        <div className="flex items-center justify-center py-20 text-sm text-[var(--text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin mr-3 text-[var(--crimson)]" />
          Loading your assigned niche leads...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Niche & Lead Reveal" breadcrumbs={["Home", "Niche Assignment"]}>
      {/* Niche Reveal Banner */}
      {nicheInfo && (
        <div className="bg-[var(--dark)] text-white rounded-3xl p-8 mb-8 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[var(--crimson)]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-[var(--crimson)] text-white flex items-center justify-center text-4xl shadow-lg border border-white/20">
                {nicheInfo.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-green-400">
                    Assigned Team Niche
                  </span>
                  <Badge variant="warning" size="sm">Day 1 Unlock</Badge>
                </div>
                <h1
                  className="text-3xl md:text-4xl font-extrabold"
                >
                  {nicheInfo.name}
                </h1>
                <p className="text-gray-300 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
                  {nicheInfo.description}
                </p>
              </div>
            </div>

            <div className="flex md:flex-col gap-3 bg-white/5 border border-white/10 rounded-2xl p-5 min-w-[200px]">
              <Link
                href="/deals/new"
                className="w-full py-3 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Briefcase className="w-4 h-4" /> Submit New Deal
              </Link>
              <Link
                href="/briefing"
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                View Today's Mission →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error & Claim Error */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchLeads}
            className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-100 hover:bg-red-200 font-bold text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}
      {claimError && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {claimError}
        </div>
      )}

      {/* Pre-Qualified Leads Pipeline */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-extrabold text-[var(--text-primary)]"
          >
            Pre-Qualified Leads ({leads.length})
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Claim leads to lock them for your team. Once claimed, competitor teams cannot access this contact.
          </p>
        </div>
        <Badge variant="default" size="md">
          Your Team Claimed: {claimedCount} / {leads.length}
        </Badge>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--crimson-pale)] flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-[var(--crimson)]" />
          </div>
          <h3 className="text-xl font-bold font-display mb-2">No Leads Assigned Yet</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed">
            Your team hasn't been assigned leads in this niche yet. The organizer will load your lead pipeline shortly. Check back in a few minutes!
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-4 font-mono">💡 Tip: Once leads appear, claim them fast — it's first-come, first-served.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leads.map((lead) => {
            const isClaimed = lead.status === "claimed" || lead.status === "contacted";
            const isClaiming = claimingId === lead._id;

            return (
              <div
                key={lead._id}
                className={`card p-6 border transition-all flex flex-col justify-between ${
                  isClaimed
                    ? "border-[var(--crimson)] bg-white shadow-md ring-2 ring-[var(--crimson)]/10"
                    : "border-[var(--border)] bg-white hover:border-[var(--border-strong)]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={isClaimed ? "success" : "default"} size="sm">
                          {isClaimed ? "Claimed ✓" : "Available to Claim"}
                        </Badge>
                        {lead.city && (
                          <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {lead.city}
                          </span>
                        )}
                      </div>
                      <h3
                        className="font-extrabold text-xl text-[var(--text-primary)]"
                      >
                        {lead.businessName}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] font-semibold mt-0.5">
                        Contact: {lead.contactName}&nbsp;•&nbsp;
                        {/* Only show phone for claimed leads or admin/organizer */}
                        {isClaimed || ["admin", "organizer"].includes(userRole)
                          ? lead.phone
                          : "🔒 Claim to reveal"}
                      </p>
                    </div>

                    {lead.estimatedValue && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-black text-[var(--crimson)]">
                          ₹{(lead.estimatedValue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Est. Deal</div>
                      </div>
                    )}
                  </div>

                  {/* AI Pitch Brief */}
                  <div className="my-4">
                    <button
                      onClick={() => setOpenBriefId(openBriefId === lead._id ? null : lead._id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--surface-alt)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors flex items-center gap-1.5"
                    >
                      🤖 AI Brief
                    </button>
                    {openBriefId === lead._id && (
                      <div className="mt-3 bg-[var(--crimson)]/5 border border-[var(--crimson)]/20 rounded-xl p-3 text-xs space-y-2">
                        <div>
                          <strong className="text-[var(--text-primary)]">Gap: </strong>
                          <span className="text-[var(--text-secondary)]">{lead.gapAnalysis || 'No digital presence detected'}</span>
                        </div>
                        <div>
                          <strong className="text-[var(--text-primary)]">Pitch: </strong>
                          <span className="text-[var(--text-secondary)]">{lead.suggestedPitch || "Introduce GWD's web services"}</span>
                        </div>
                        {lead.estimatedValue && (
                          <div>
                            <strong className="text-[var(--text-primary)]">Est. Value: </strong>
                            <span className="text-[var(--text-secondary)]">₹{lead.estimatedValue.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Strip */}
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {isClaimed && (
                      <>
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-2.5 rounded-xl bg-[var(--surface-alt)] hover:bg-gray-200 text-gray-700 transition-colors"
                          title="Call Contact"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`mailto:${lead.email}`}
                          className="p-2.5 rounded-xl bg-[var(--surface-alt)] hover:bg-gray-200 text-gray-700 transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </>
                    )}
                  </div>

                  {isClaimed ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          const pitchText = lead.suggestedPitch || "Hello! I'm reaching out from GWD Global regarding your business. We help local businesses like yours get a professional website. Can we connect?";
                          const url = `https://wa.me/91${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(pitchText)}`;
                          window.open(url, '_blank');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-sm font-bold rounded-xl hover:bg-[#1ebe5d] transition-all"
                      >
                        <MessageCircle className="w-4 h-4" /> Send WhatsApp Pitch
                      </button>
                      <Link
                        href="/deals/new"
                        className="px-4 py-2 bg-[var(--crimson)] text-white font-bold text-xs rounded-xl hover:bg-[var(--crimson-dark)] transition-colors shadow-2xs"
                      >
                        Log Pitch / Submit Deal →
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaim(lead._id)}
                      disabled={isClaiming}
                      className="px-5 py-2 bg-[var(--dark)] hover:bg-black text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {isClaiming ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Briefcase className="w-3.5 h-3.5" />
                      )}
                      <span>{isClaiming ? "Claiming..." : "Claim This Lead"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
