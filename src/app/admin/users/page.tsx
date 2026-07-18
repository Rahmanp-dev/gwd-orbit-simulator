"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import {
  Users,
  Search,
  ChevronLeft,
  Briefcase,
  Mail,
  Phone,
  Shield,
  Award,
  Loader2,
  X,
  AlertCircle,
  Ban,
  UserCheck,
  Plus,
  Minus,
  Check,
} from "lucide-react";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  participantRole?: string;
  orbitScore: number;
  tier: string;
  teamId?: { _id: string; name: string; emoji: string } | null;
  nicheId?: { _id: string; name: string; icon: string; color: string } | null;
  suspended: boolean;
  onboardingComplete: boolean;
  createdAt: string;
}

interface TeamOption {
  _id: string;
  name: string;
  emoji: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Edit Drawer/Modal State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPartRole, setEditPartRole] = useState("");
  const [editTeamId, setEditTeamId] = useState("");
  const [editSuspended, setEditSuspended] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Score Adjustment State
  const [scorePoints, setScorePoints] = useState("");
  const [scoreReason, setScoreReason] = useState("");
  const [isAdjustingScore, setIsAdjustingScore] = useState(false);

  // Status & Feedback Messages
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  // ── Fetch Users ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/users", window.location.origin);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", "15");
      if (search.trim()) url.searchParams.set("search", search.trim());
      if (roleFilter !== "all") url.searchParams.set("role", roleFilter);
      if (teamFilter !== "all") url.searchParams.set("teamId", teamFilter);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load user directory");
      const data = await res.json();
      setUsers(data.users || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotalUsers(data.pagination.total || 0);
      }
    } catch (err: any) {
      showError(err.message || "Could not retrieve user telemetry.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, teamFilter]);

  // ── Fetch Team Options ──────────────────────────────────────────────────────
  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      }
    } catch (err) {
      console.error("Failed to load teams:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchTeams();
  }, []);

  // Reset page to 1 when filters change
  const handleFilterChange = (filterType: string, val: string) => {
    setPage(1);
    if (filterType === "role") setRoleFilter(val);
    if (filterType === "team") setTeamFilter(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // ── Open Edit Drawer ────────────────────────────────────────────────────────
  const openEditDrawer = (user: UserItem) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || "");
    setEditRole(user.role);
    setEditPartRole(user.participantRole || "deal_architect");
    setEditTeamId(user.teamId ? (typeof user.teamId === "object" ? user.teamId._id : user.teamId) : "");
    setEditSuspended(user.suspended);
    
    // Reset score form
    setScorePoints("");
    setScoreReason("");
    setErrorMsg("");
  };

  // ── Submit User Edits ──────────────────────────────────────────────────────
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsUpdating(true);
    setErrorMsg("");
    
    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          role: editRole,
          participantRole: editRole === "participant" ? editPartRole : undefined,
          teamId: editRole === "participant" && editTeamId ? editTeamId : null,
          suspended: editSuspended,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      // Update state
      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? { ...u, ...data.user } : u))
      );
      
      // Update selectedUser reference
      setSelectedUser({ ...selectedUser, ...data.user });
      
      showSuccess("User parameters updated successfully.");
    } catch (err: any) {
      showError(err.message || "Profile update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Submit Score Adjustment ────────────────────────────────────────────────
  const handleAdjustScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!scorePoints || isNaN(Number(scorePoints))) {
      showError("Please specify a valid score difference.");
      return;
    }
    if (!scoreReason.trim()) {
      showError("Please document the rationale for adjustment.");
      return;
    }

    setIsAdjustingScore(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: Number(scorePoints),
          reason: scoreReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust score");

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? { ...u, orbitScore: data.orbitScore, tier: data.tier }
            : u
        )
      );

      // Update drawer view
      setSelectedUser((prev) => prev ? { ...prev, orbitScore: data.orbitScore, tier: data.tier } : null);

      showSuccess(`Manual score adjusted: ${scorePoints} points.`);
      setScorePoints("");
      setScoreReason("");
    } catch (err: any) {
      showError(err.message || "Manual score ledger transaction failed.");
    } finally {
      setIsAdjustingScore(false);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "partner":
        return <Badge variant="danger" size="sm">Partner</Badge>;
      case "elite":
        return <Badge variant="warning" size="sm">Elite</Badge>;
      case "pro":
        return <Badge variant="success" size="sm">Pro</Badge>;
      default:
        return <Badge variant="outline" size="sm">Member</Badge>;
    }
  };

  return (
    <DashboardLayout title="Admin User Directory" breadcrumbs={["Home", "Admin", "Users Directory"]}>
      {/* Toast Alert */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-[var(--crimson)] text-white text-[10px] font-bold uppercase tracking-wider">
              Control Panel
            </span>
            <Badge variant="default" size="sm">{totalUsers} Registered Accounts</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
            Participant & Staff Directory
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Audit participant career tracks, evaluate individual orbit points, manage team assignments, and suspend accounts.
          </p>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] transition-colors flex items-center gap-1.5 bg-white"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 mb-6 border border-[var(--border)] bg-white flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs bg-white font-semibold text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
          >
            <option value="all">All Roles</option>
            <option value="participant">Participants</option>
            <option value="judge">Judges</option>
            <option value="admin">Admins</option>
            <option value="organizer">Organizers</option>
          </select>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => handleFilterChange("team", e.target.value)}
            className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-xs bg-white font-semibold text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.emoji} {t.name}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {(roleFilter !== "all" || teamFilter !== "all" || search) && (
            <button
              onClick={() => {
                setRoleFilter("all");
                setTeamFilter("all");
                setSearch("");
                setPage(1);
              }}
              className="text-[var(--crimson)] hover:underline text-xs font-semibold px-2 py-1"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email..."
            className="w-full pl-9 pr-4 py-2 border border-[var(--border)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-[var(--surface-alt)] font-medium"
          />
        </form>
      </div>

      {/* Directory Table */}
      <div className="card border border-[var(--border)] bg-white overflow-hidden shadow-xs rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-xs text-[var(--text-muted)] font-semibold">
            <Loader2 className="w-5 h-5 animate-spin mr-3 text-[var(--crimson)]" />
            Synchronizing participant ledger...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-secondary)]">
            <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="font-bold text-sm">No accounts found</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try adjusting your filters or query parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--surface-alt)] border-b border-[var(--border)] text-[var(--text-muted)] font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-5">Participant Details</th>
                  <th className="py-4 px-5">Assigned Track & Team</th>
                  <th className="py-4 px-5">Contact Telemetry</th>
                  <th className="py-4 px-5">Orbit Career Tier</th>
                  <th className="py-4 px-5 text-right">Points Balance</th>
                  <th className="py-4 px-5 text-center">Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-[var(--surface-alt)]/40 transition-colors cursor-pointer ${
                      selectedUser?._id === user._id ? "bg-[var(--surface-alt)]/60 font-semibold" : ""
                    }`}
                    onClick={() => openEditDrawer(user)}
                  >
                    {/* Name & Suspension Status */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--dark)] text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px] shadow-sm uppercase">
                          {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--text-primary)]">{user.name}</div>
                          {user.suspended ? (
                            <span className="text-[10px] text-red-500 font-bold flex items-center gap-0.5">
                              <Ban className="w-3 h-3" /> Suspended
                            </span>
                          ) : (
                            <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span> Active
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role & Team */}
                    <td className="py-4 px-5">
                      <div className="font-bold text-[var(--crimson)] capitalize">{user.role}</div>
                      {user.role === "participant" && (
                        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                          {user.participantRole?.replace("_", " ")}
                        </div>
                      )}
                      <div className="text-[11px] text-[var(--text-secondary)] font-semibold mt-1 flex items-center gap-1">
                        {user.teamId ? (
                          <>
                            <span>{user.teamId.emoji}</span>
                            <span>{user.teamId.name}</span>
                          </>
                        ) : (
                          <span className="text-[var(--text-muted)] italic font-normal">No Squad Assigned</span>
                        )}
                      </div>
                    </td>

                    {/* Contacts */}
                    <td className="py-4 px-5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-primary)] font-medium">
                        <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-mono">
                          <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {user.phone}
                        </div>
                      )}
                    </td>

                    {/* Career Tier */}
                    <td className="py-4 px-5">
                      {getTierBadge(user.tier)}
                    </td>

                    {/* Score Balance */}
                    <td className="py-4 px-5 text-right font-black text-sm text-[var(--crimson)]">
                      {user.orbitScore.toLocaleString()} pts
                    </td>

                    {/* Action button */}
                    <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditDrawer(user)}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border)] hover:border-[var(--crimson)] hover:text-[var(--crimson)] font-bold transition-all text-[11px] bg-white shadow-3xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-alt)]/40 flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] font-semibold">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-xs font-semibold hover:bg-[var(--surface-alt)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-xs font-semibold hover:bg-[var(--surface-alt)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer / Edit Modal Panel */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Overlay background */}
          <div
            onClick={() => setSelectedUser(null)}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-[var(--border)] p-6">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-6">
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-[var(--crimson)]" />
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Participant Command Deck
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-alt)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* General Feedback Box */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 p-3.5 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium leading-relaxed">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}

              {/* Top Summary Block */}
              <div className="bg-[var(--surface-alt)] rounded-2xl p-4 border border-[var(--border)] mb-6 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-base text-[var(--text-primary)]">{selectedUser.name}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">{selectedUser.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg text-[var(--crimson)]">{selectedUser.orbitScore} pts</div>
                  <div className="mt-0.5">{getTierBadge(selectedUser.tier)}</div>
                </div>
              </div>

              {/* Forms Panel */}
              <div className="space-y-6">
                {/* 1. Account settings form */}
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] pb-1 border-b border-[var(--border)]">
                    Profile & Credentials Parameters
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs font-semibold bg-[var(--surface-alt)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs font-semibold bg-[var(--surface-alt)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] mb-1">
                        System Role
                      </label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs font-semibold bg-white"
                      >
                        <option value="participant">Participant</option>
                        <option value="judge">Judge</option>
                        <option value="admin">Admin</option>
                        <option value="organizer">Organizer</option>
                      </select>
                    </div>

                    {editRole === "participant" && (
                      <div>
                        <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] mb-1">
                          Career Track (Participant Role)
                        </label>
                        <select
                          value={editPartRole}
                          onChange={(e) => setEditPartRole(e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs font-semibold bg-white"
                        >
                          <option value="deal_architect">Deal Architect (DA)</option>
                          <option value="project_manager">Project Manager (PM)</option>
                          <option value="developer">Full-Stack Developer</option>
                          <option value="designer">UI/UX & Brand Designer</option>
                          <option value="wildcard">Wild Card Track</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {editRole === "participant" && (
                    <div>
                      <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] mb-1">
                        Squad Assignment
                      </label>
                      <select
                        value={editTeamId}
                        onChange={(e) => setEditTeamId(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs font-semibold bg-white"
                      >
                        <option value="">No Squad Assigned</option>
                        {teams.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.emoji} {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Suspension Toggle */}
                  <div className="flex items-center justify-between p-3.5 border border-[var(--border)] rounded-xl bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <Ban className={`w-4.5 h-4.5 ${editSuspended ? "text-red-500" : "text-[var(--text-muted)]"}`} />
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">Suspend Account Access</div>
                        <div className="text-[10px] text-[var(--text-muted)]">Revokes active token session immediately</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editSuspended}
                        onChange={(e) => setEditSuspended(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-2.5 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Parameters Updates
                  </button>
                </form>

                {/* 2. Score adjustment form */}
                <form onSubmit={handleAdjustScore} className="space-y-4 pt-4 border-t border-[var(--border)]">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] pb-1 border-b border-[var(--border)] flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[var(--crimson)]" /> Manual Points Ledger Adjuster
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] mb-1">
                        Adjustment (+/-)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="-25 or 50"
                        value={scorePoints}
                        onChange={(e) => setScorePoints(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs font-semibold bg-[var(--surface-alt)] font-mono text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-extrabold text-[var(--text-secondary)] mb-1">
                        Audit Rationale
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Fabricated evidence penalty, design award..."
                        value={scoreReason}
                        onChange={(e) => setScoreReason(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-xs font-semibold bg-[var(--surface-alt)]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAdjustingScore}
                    className="w-full py-2.5 bg-[var(--dark)] hover:bg-[var(--dark)]/90 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isAdjustingScore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Publish Ledger Entry
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 border border-[var(--border)] hover:bg-[var(--surface-alt)] text-[var(--text-secondary)] text-xs font-bold rounded-xl transition-colors"
              >
                Close command deck
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
