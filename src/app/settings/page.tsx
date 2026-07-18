"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import { useUserRole } from "@/hooks/useUserRole";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  CreditCard,
  Bell,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  participantRole: string;
  teamId?: { name: string; emoji: string } | string;
  upiId?: string;
  bio?: string;
  linkedin?: string;
  notificationPrefs?: { whatsapp?: boolean; email?: boolean };
}

const PARTICIPANT_ROLES = [
  {
    id: "deal_architect",
    label: "Deal Architect (DA)",
    share: "15% Commission",
    desc: "Client prospecting, proposals, & closing",
  },
  {
    id: "project_manager",
    label: "Project Manager (PM)",
    share: "10% Commission",
    desc: "Client agreements, Razorpay & milestone tracking",
  },
  {
    id: "developer",
    label: "Full-Stack Developer",
    share: "45% Squad Share",
    desc: "Next.js, MongoDB & Vercel deployment",
  },
  {
    id: "designer",
    label: "UI/UX & Brand Designer",
    share: "45% Squad Share",
    desc: "Interactive wireframes & visual assets",
  },
];

export default function SettingsPage() {
  const { name: sessionName, role: sessionRole, initials } = useUserRole();

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    role: "",
    participantRole: "deal_architect",
    upiId: "",
    bio: "",
    linkedin: "",
    notificationPrefs: { whatsapp: true, email: true },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // ── Load real user profile from API ─────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me");
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setProfile({
          name: u.name ?? "",
          email: u.email ?? "",
          phone: u.phone ?? "",
          role: u.role ?? "",
          participantRole: u.participantRole ?? "deal_architect",
          teamId: u.teamId,
          upiId: u.upiId ?? "",
          bio: u.bio ?? "",
          linkedin: u.linkedin ?? "",
          notificationPrefs: u.notificationPrefs ?? { whatsapp: true, email: true },
        });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Save handler ─────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          upiId: profile.upiId,
          bio: profile.bio,
          linkedin: profile.linkedin,
          notificationPrefs: profile.notificationPrefs,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const teamName =
    typeof profile.teamId === "object" && profile.teamId !== null
      ? `${profile.teamId.emoji ?? ""} ${profile.teamId.name}`.trim()
      : "Unassigned";

  // Compute initials from profile name (fallback to sessionName from hook)
  const displayInitials =
    profile.name
      ? profile.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : initials;

  if (loading) {
    return (
      <DashboardLayout title="Profile Settings" breadcrumbs={["Home", "Settings"]}>
        <div className="flex items-center justify-center py-20 text-sm text-[var(--text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin mr-3 text-[var(--crimson)]" />
          Loading your profile...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Participant Settings" breadcrumbs={["Home", "Settings"]}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]"
          >
            Profile & Payout Settings
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Manage your contact info and UPI payout address for BizSim cash prizes.
          </p>
        </div>
        {saved && (
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-600" /> Settings saved successfully!
          </div>
        )}
        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="card p-6 border border-[var(--border)] shadow-sm space-y-4">
            <h2
              className="text-lg font-bold flex items-center gap-2 pb-3 border-b border-[var(--border)]"
            >
              <User className="w-5 h-5 text-[var(--crimson)]" /> Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  GWD Registered Email
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-[var(--text-muted)] mt-1 inline-block">
                  Email cannot be changed — contact admin
                </span>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Assigned Team Squad
                </label>
                <input
                  type="text"
                  disabled
                  value={teamName}
                  className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-gray-100 text-gray-600 cursor-not-allowed font-semibold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Short Bio (optional)
                </label>
                <textarea
                  rows={2}
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell your team about yourself..."
                  className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-white resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={profile.linkedin}
                  onChange={(e) => setProfile((p) => ({ ...p, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-white"
                />
              </div>
            </div>
          </div>

          {/* Role Display (read-only) */}
          <div className="card p-6 border border-[var(--border)] shadow-sm space-y-4">
            <h2
              className="text-lg font-bold flex items-center gap-2 pb-3 border-b border-[var(--border)]"
            >
              <Briefcase className="w-5 h-5 text-[var(--crimson)]" /> Your Orbit Role
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Your system role is assigned by the event organizer and cannot be self-changed.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border border-[var(--crimson)] bg-[var(--crimson-pale)]/60 ring-2 ring-[var(--crimson)]/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    {profile.participantRole
                      ? PARTICIPANT_ROLES.find((r) => r.id === profile.participantRole)?.label ??
                        profile.participantRole
                      : "Not assigned"}
                  </span>
                  <Badge variant="danger" size="sm">
                    {PARTICIPANT_ROLES.find((r) => r.id === profile.participantRole)?.share ?? ""}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {PARTICIPANT_ROLES.find((r) => r.id === profile.participantRole)?.desc ?? ""}
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]">
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  System Role
                </div>
                <div className="font-bold text-sm text-[var(--crimson)] capitalize">{profile.role}</div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Assigned by GWD Organizer
                </p>
              </div>
            </div>
          </div>

          {/* UPI & Payout */}
          <div className="card p-6 border border-[var(--border)] shadow-sm space-y-4">
            <h2
              className="text-lg font-bold flex items-center gap-2 pb-3 border-b border-[var(--border)]"
            >
              <CreditCard className="w-5 h-5 text-[var(--crimson)]" /> Prize Payout Address (Razorpay / UPI)
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Enter your verified UPI VPA where cash prizes from the ₹1,20,000 pool will be transferred.
            </p>
            <div className="max-w-md">
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                UPI ID / Virtual Address *
              </label>
              <input
                type="text"
                value={profile.upiId}
                onChange={(e) => setProfile((p) => ({ ...p, upiId: e.target.value }))}
                placeholder="e.g. yourname@okaxis"
                className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-white"
              />
              {profile.upiId && /^[\w.\-]+@[\w]+$/.test(profile.upiId) && (
                <span className="text-[10px] text-[var(--success)] font-semibold mt-1 inline-block">
                  ✓ Valid UPI format
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors shadow-md disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Profile Settings"}
            </button>
          </div>
        </div>

        {/* Right 1 Col */}
        <div className="space-y-6">
          {/* Avatar */}
          <div className="card p-6 border border-[var(--border)] shadow-sm text-center">
            <div className="w-24 h-24 rounded-full bg-[var(--dark)] text-white text-2xl font-black mx-auto mb-3 flex items-center justify-center shadow-inner border-4 border-white">
              {displayInitials}
            </div>
            <h3 className="font-bold text-base">{profile.name || sessionName}</h3>
            <p className="text-xs text-[var(--crimson)] font-semibold mt-0.5 capitalize">
              {profile.participantRole?.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{teamName}</p>
          </div>

          {/* Notification Prefs */}
          <div className="card p-6 border border-[var(--border)] shadow-sm space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--crimson)]" /> Instant Alert Preferences
            </h3>

            <label className="flex items-start justify-between cursor-pointer pt-2">
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">WhatsApp Lead & Deal Alerts</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Receive instant WhatsApp messages when your deal is approved or paid.
                </div>
              </div>
              <input
                type="checkbox"
                checked={profile.notificationPrefs?.whatsapp ?? true}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    notificationPrefs: { ...p.notificationPrefs, whatsapp: e.target.checked },
                  }))
                }
                className="mt-1 rounded border-[var(--border-strong)] text-[var(--crimson)] focus:ring-[var(--crimson)]"
              />
            </label>

            <label className="flex items-start justify-between cursor-pointer pt-2 border-t border-[var(--border)]">
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">Email Digest Alerts</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Daily email summary of team scores, rank changes, and new missions.
                </div>
              </div>
              <input
                type="checkbox"
                checked={profile.notificationPrefs?.email ?? true}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    notificationPrefs: { ...p.notificationPrefs, email: e.target.checked },
                  }))
                }
                className="mt-1 rounded border-[var(--border-strong)] text-[var(--crimson)] focus:ring-[var(--crimson)]"
              />
            </label>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
