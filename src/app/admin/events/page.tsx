"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  ChevronLeft,
  Send,
  Sparkles,
  Zap,
  Shield,
  Activity,
  CheckCircle2,
  Bell,
  RefreshCw,
  Loader2,
  RotateCcw,
  ArrowRight,
  Database,
  Camera,
  Trash2,
  FileText,
  Upload,
  Download,
  AlertCircle
} from "lucide-react";

interface BroadcastEntry {
  time: string;
  title: string;
  message: string;
  sentBy?: string;
}

interface EventState {
  _id?: string;
  name: string;
  status: string;
  currentDay: number;
  totalDays: number;
  demoMode: boolean;
  broadcastMessages: BroadcastEntry[];
}

interface SnapshotEntry {
  _id: string;
  name: string;
  description?: string;
  createdBy?: { name: string; email: string } | null;
  collectionCounts: Record<string, number>;
  sizeBytes?: number;
  createdAt: string;
}

const DAY_LABELS: Record<number, string> = {
  1: "Orientation & Niche Reveal",
  2: "Lead Research & First Pitches",
  3: "Discovery Calls & Wireframes",
  4: "Close or Lose (Deadline Day)",
  5: "Delivery Sprint Begins",
  6: "QA & Client Review",
  7: "Presentation Prep",
  8: "Sponsor Showcase",
  9: "Grand Finale & Awards",
};

export default function AdminEventsSettingsPage() {
  const [event, setEvent] = useState<EventState>({
    name: "GWD BizSim 2026",
    status: "active",
    currentDay: 4,
    totalDays: 9,
    demoMode: true,
    broadcastMessages: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Snapshots State
  const [snapshots, setSnapshots] = useState<SnapshotEntry[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  const [snapshotDesc, setSnapshotDesc] = useState("");
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  
  // Modals / Confirmations
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [showRestoreModal, setShowRestoreModal] = useState<string | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState("");

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBackup, setIsUploadingBackup] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4500);
  };

  // ── Fetch Event State ──────────────────────────────────────────────────────
  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/event");
      if (res.ok) {
        const data = await res.json();
        if (data.event) setEvent(data.event);
      }
    } catch (err) {
      console.error("Failed to fetch event state:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch Snapshots ────────────────────────────────────────────────────────
  const fetchSnapshots = useCallback(async () => {
    setLoadingSnapshots(true);
    try {
      const res = await fetch("/api/admin/snapshots");
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data.snapshots || []);
      }
    } catch (err) {
      console.error("Failed to fetch snapshots list:", err);
    } finally {
      setLoadingSnapshots(false);
    }
  }, []);

  useEffect(() => {
    fetchEvent();
    fetchSnapshots();
  }, [fetchEvent, fetchSnapshots]);

  // ── Dispatch Admin Control Action ───────────────────────────────────────────
  const dispatchAction = async (
    action: string,
    payload: Record<string, unknown> = {}
  ) => {
    setActionLoading(action);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/event", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      if (data.event) {
        setEvent((prev) => ({ ...prev, ...data.event }));
      }
      if (data.broadcast) {
        setEvent((prev) => ({
          ...prev,
          broadcastMessages: [data.broadcast, ...prev.broadcastMessages],
        }));
      }

      showSuccess(data.message || "Action executed successfully.");
      
      // If reset was performed, reload everything
      if (action === "reset_event") {
        fetchSnapshots();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      showError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdvanceDay = () => {
    if (event.currentDay >= event.totalDays) {
      showError("Simulation has already reached the Day 9 Grand Finale.");
      return;
    }
    if (
      !confirm(
        `Advance simulation from Day ${event.currentDay} to Day ${event.currentDay + 1}?\n\nThis will trigger daily scoring recalculation and unlock new daily briefings.`
      )
    )
      return;
    dispatchAction("advance_day");
  };

  const handleRewindDay = () => {
    if (event.currentDay <= 1) {
      showError("Simulation is already at Day 1.");
      return;
    }
    if (
      !confirm(
        `Rewind simulation from Day ${event.currentDay} to Day ${event.currentDay - 1}?\n\nThis will shift the Day counter back. Make sure to audit ranks and scores manually if necessary.`
      )
    )
      return;
    dispatchAction("rewind_day");
  };

  const handleJumpDay = (day: number) => {
    if (day === event.currentDay) return;
    if (
      !confirm(
        `Jump simulation day directly to Day ${day}?\n\nThis will lock/unlock target milestones instantly.`
      )
    )
      return;
    dispatchAction("set_day", { targetDay: day });
  };

  const handleToggleStatus = () => {
    const newAction = event.status === "active" ? "pause" : "resume";
    dispatchAction(newAction);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    await dispatchAction("broadcast", { broadcastMessage });
    setBroadcastMessage("");
  };

  const handleToggleDemo = () => {
    dispatchAction("toggle_demo", { demoMode: !event.demoMode });
  };

  // ── Create Snapshot ────────────────────────────────────────────────────────
  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName.trim()) return;
    setIsCreatingSnapshot(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: snapshotName.trim(),
          description: snapshotDesc.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Snapshot generation failed");

      showSuccess(`Snapshot '${snapshotName}' created.`);
      setSnapshotName("");
      setSnapshotDesc("");
      fetchSnapshots();
    } catch (err: any) {
      showError(err.message || "Failed to save server snapshot.");
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // ── Delete Snapshot ────────────────────────────────────────────────────────
  const handleDeleteSnapshot = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete snapshot '${name}'?`)) return;
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/snapshots/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete snapshot");
      }
      showSuccess(`Snapshot '${name}' removed.`);
      fetchSnapshots();
    } catch (err: any) {
      showError(err.message || "Snapshot deletion failed.");
    }
  };

  // ── Restore Snapshot ────────────────────────────────────────────────────────
  const handleRestoreSnapshot = async (id: string) => {
    if (restoreConfirmText !== id) {
      showError("Confirmation code does not match.");
      return;
    }
    setActionLoading("restore_snapshot");
    setErrorMsg("");
    setShowRestoreModal(null);
    setRestoreConfirmText("");

    try {
      const res = await fetch(`/api/admin/snapshots/${id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmToken: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Snapshot rollback failed");

      showSuccess("Event rollback completed successfully.");
      fetchEvent();
    } catch (err: any) {
      showError(err.message || "Rollback failed.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reset Event ────────────────────────────────────────────────────────────
  const handleResetEvent = async () => {
    if (resetConfirmText.toUpperCase() !== "RESET") {
      showError("Invalid validation phrase.");
      return;
    }
    setShowResetModal(false);
    setResetConfirmText("");
    await dispatchAction("reset_event");
  };

  // ── Upload Backup JSON ──────────────────────────────────────────────────────
  const handleUploadBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") return;
        const json = JSON.parse(text);

        setIsUploadingBackup(true);
        setErrorMsg("");

        const res = await fetch("/api/admin/backup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Restore process failed");

        showSuccess("Database successfully restored from JSON backup.");
        fetchEvent();
        fetchSnapshots();
      } catch (err: any) {
        showError(err.message || "Invalid backup snapshot JSON format.");
      } finally {
        setIsUploadingBackup(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // ── Re-seed Data ────────────────────────────────────────────────────────────
  const handleReseedData = async () => {
    if (!confirm("Are you sure you want to completely wipe the database and reload the default BizSim demo dataset? This will erase all manual changes.")) return;
    setActionLoading("seed");
    setErrorMsg("");

    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seeding failed");

      showSuccess("Demo database re-seeded successfully.");
      fetchEvent();
      fetchSnapshots();
    } catch (err: any) {
      showError(err.message || "Database seeding failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const isLive = event.status === "active";

  if (loading) {
    return (
      <DashboardLayout
        title="Admin Event Day & System Controls"
        breadcrumbs={["Home", "Admin", "Event Controls"]}
      >
        <div className="flex items-center justify-center py-20 text-sm text-[var(--text-muted)] font-semibold">
          <Loader2 className="w-6 h-6 animate-spin mr-3 text-[var(--crimson)]" />
          Synchronizing event telemetry...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Event Day & System Controls"
      breadcrumbs={["Home", "Admin", "Event Controls"]}
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-0.5 rounded-full bg-[var(--crimson)] text-white text-[10px] font-bold uppercase tracking-wider">
              Simulation Engine Control Switch
            </span>
            <Badge variant={isLive ? "success" : "warning"} size="sm">
              {isLive ? "🟢 LIVE" : "⏸ PAUSED"} · Day {event.currentDay} of {event.totalDays}
            </Badge>
            {successMsg && (
              <span className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold shadow-3xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> {successMsg}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
            Event Lifecycle & Telemetry Controls
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Advance or rewind simulation days, restore data checkpoints, dispatch alerts, and trigger backups.
          </p>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] transition-colors flex items-center gap-1.5 bg-white"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium leading-relaxed">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Timeline Progression & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Day Odyssey Panel */}
          <div className="card p-6 border border-[var(--border)] bg-white rounded-2xl shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
              <div>
                <span className="text-xs font-bold text-[var(--crimson)] uppercase tracking-wider">
                  Active Simulation Timeline
                </span>
                <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">
                  Day {event.currentDay} — {DAY_LABELS[event.currentDay] ?? "Simulation Day"}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Advancing locks previous submissions. Jumps bypass states, and rewinds allow error-recovery.
                </p>
              </div>

              {/* Day Actions Control */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Pause/Resume */}
                <button
                  onClick={handleToggleStatus}
                  disabled={actionLoading !== null}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border disabled:opacity-60 ${
                    isLive
                      ? "border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border-green-500 bg-green-50 text-green-800 hover:bg-green-100"
                  }`}
                >
                  {actionLoading === "pause" || actionLoading === "resume" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isLive ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  {isLive ? "Pause" : "Resume"}
                </button>

                {/* Rewind Day */}
                <button
                  onClick={handleRewindDay}
                  disabled={actionLoading !== null || event.currentDay <= 1}
                  className="px-3 py-2 border border-[var(--border)] bg-white hover:bg-[var(--surface-alt)] text-[var(--text-secondary)] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  title="Rewind 1 Day"
                >
                  {actionLoading === "rewind_day" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span>Rewind</span>
                </button>

                {/* Advance Day */}
                <button
                  onClick={handleAdvanceDay}
                  disabled={actionLoading !== null || event.currentDay >= event.totalDays}
                  className="px-4 py-2 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white rounded-xl text-xs font-bold transition-colors shadow-3xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading === "advance_day" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  <span>
                    {event.currentDay >= event.totalDays
                      ? "Finale Reached"
                      : `Advance to D${event.currentDay + 1} →`}
                  </span>
                </button>
              </div>
            </div>

            {/* Timeline track */}
            <div className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  9-Day Odyssey Track
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] font-semibold">
                  <span>Jump To:</span>
                  <select
                    value={event.currentDay}
                    onChange={(e) => handleJumpDay(Number(e.target.value))}
                    disabled={actionLoading !== null}
                    className="border border-[var(--border)] rounded px-1.5 py-0.5 bg-white text-xs text-[var(--text-primary)]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                      <option key={d} value={d}>
                        Day {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Progress track boxes */}
              <div className="grid grid-cols-9 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <div
                    key={d}
                    onClick={() => handleJumpDay(d)}
                    className={`py-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                      d === event.currentDay
                        ? "bg-[var(--crimson)] text-white border-[var(--crimson)] shadow-xs scale-105"
                        : d < event.currentDay
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-[var(--surface-alt)] text-[var(--text-muted)] border-[var(--border)]"
                    }`}
                    title={DAY_LABELS[d]}
                  >
                    D{d}
                  </div>
                ))}
              </div>
              
              {/* Timeline labels */}
              <div className="mt-2 grid grid-cols-9 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <div
                    key={d}
                    className={`text-center text-[8px] font-medium leading-tight transition-all truncate px-0.5 ${
                      d === event.currentDay
                        ? "text-[var(--crimson)] font-extrabold"
                        : d < event.currentDay
                        ? "text-green-600 font-bold"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {DAY_LABELS[d]?.split(" ")[0] ?? ""}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Snapshot Manager */}
          <div className="card p-6 border border-[var(--border)] bg-white rounded-2xl shadow-2xs">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[var(--crimson)]" /> Server Restore Points & Snapshot Vault
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              Take server snapshots of the database state. Reverting drops transaction data back to the checkpoint. Capped at 20 snapshots.
            </p>

            <form onSubmit={handleCreateSnapshot} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-[var(--surface-alt)]/50 p-4 border border-[var(--border)] rounded-2xl">
              <div className="md:col-span-1">
                <input
                  type="text"
                  required
                  placeholder="Snapshot Label (e.g. End of Day 3)"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[var(--border)] rounded-xl text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
                />
              </div>
              <div className="md:col-span-1">
                <input
                  type="text"
                  placeholder="Optional brief notes..."
                  value={snapshotDesc}
                  onChange={(e) => setSnapshotDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[var(--border)] rounded-xl text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
                />
              </div>
              <div className="md:col-span-1">
                <button
                  type="submit"
                  disabled={isCreatingSnapshot || !snapshotName.trim()}
                  className="w-full py-2 bg-[var(--dark)] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isCreatingSnapshot && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Generate Snapshot
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                Available Restore Checkpoints ({snapshots.length})
              </h3>

              {loadingSnapshots ? (
                <div className="text-center py-6 text-xs text-[var(--text-muted)] font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> Fetching vault indexes...
                </div>
              ) : snapshots.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic text-center py-6 border border-dashed border-[var(--border)] rounded-xl">
                  No restore checkpoints created yet.
                </p>
              ) : (
                <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden bg-white">
                  {snapshots.map((snap) => (
                    <div key={snap._id} className="p-3.5 hover:bg-[var(--surface-alt)]/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-extrabold text-[var(--text-primary)] text-sm">{snap.name}</div>
                        {snap.description && (
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-medium">{snap.description}</p>
                        )}
                        <div className="text-[10px] text-[var(--text-muted)] mt-1.5 flex items-center gap-2.5 font-medium">
                          <span>📅 {new Date(snap.createdAt).toLocaleString()}</span>
                          {snap.createdBy && <span>👤 {snap.createdBy.name}</span>}
                          <span>💾 {(snap.sizeBytes ? (snap.sizeBytes / 1024).toFixed(1) : 0)} KB</span>
                        </div>
                      </div>

                      {/* Snap counts summary */}
                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <div className="text-[10px] font-semibold text-[var(--text-secondary)] bg-[var(--surface-alt)] px-2 py-0.5 border border-[var(--border)] rounded-lg">
                          Deals: {snap.collectionCounts?.deals || 0} | Users: {snap.collectionCounts?.users || 0}
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Restore trigger */}
                          <button
                            onClick={() => setShowRestoreModal(snap._id)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-300 hover:border-rose-500 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold transition-all shadow-3xs"
                          >
                            Rollback
                          </button>

                          {/* Delete snapshot */}
                          <button
                            onClick={() => handleDeleteSnapshot(snap._id, snap.name)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 border border-transparent hover:border-red-200 transition-all"
                            title="Delete checkpoint"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* System Broadcast Dispatcher */}
          <div className="card p-6 border border-[var(--border)] bg-white rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[var(--crimson)]" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Global System Broadcast Dispatcher
                </h2>
              </div>
              <Badge variant="danger" size="sm">Push to All Participants</Badge>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4">
              {/* Quick Message Templates */}
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Quick Templates</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "🔥 Wild Card", text: "⚡ Wild Card Challenge is LIVE! Check your mission board for a +200 pt bonus. First 3 teams to complete it win extra prizes!" },
                    { label: "⏰ 2h Warning", text: "⏰ 2 hours remaining in today's sprint! Final deals need to be submitted before midnight. Push hard!" },
                    { label: "📊 Leaderboard", text: "📊 Live leaderboard update — check who's on top! The gap is closing. Every point matters." },
                    { label: "🎉 Shoutout", text: "🏆 Amazing work today! Keep the energy up — the GWD team is watching every deal you close." },
                  ].map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => setBroadcastMessage(tpl.text)}
                      className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] hover:bg-[var(--crimson-pale)] hover:border-[var(--crimson)]/30 transition-all font-semibold"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  required
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value.slice(0, 300))}
                  placeholder="Type an urgent announcement..."
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] bg-white resize-none font-medium"
                />
                <span className={`absolute bottom-2.5 right-3 text-[10px] font-mono ${broadcastMessage.length > 250 ? "text-rose-500" : "text-[var(--text-muted)]"}`}>
                  {broadcastMessage.length}/300
                </span>
              </div>

              {/* Live Preview */}
              {broadcastMessage.trim() && (
                <div className="p-3.5 rounded-xl bg-[var(--dark)] border border-white/10 shadow-2xs">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">📡 War Room Preview</p>
                  <p className="text-xs text-white leading-normal font-medium">{broadcastMessage}</p>
                  <p className="text-[10px] text-white/40 mt-1 font-mono">— GWD Organizer · just now</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={actionLoading !== null || !broadcastMessage.trim()}
                  className="px-6 py-2.5 bg-[var(--dark)] hover:bg-black text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                  {actionLoading === "broadcast" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Dispatch Broadcast Alert</span>
                </button>
              </div>
            </form>

            {/* Broadcast History */}
            <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3">
              <h3 className="text-xs font-bold uppercase text-[var(--text-muted)]">
                Recent Broadcast History ({event.broadcastMessages.length})
              </h3>
              {event.broadcastMessages.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-4">No broadcasts sent yet.</p>
              ) : (
                event.broadcastMessages.slice(0, 10).map((item, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] flex items-start justify-between text-xs"
                  >
                    <div>
                      <strong className="text-[var(--text-primary)] font-bold">{item.title}</strong>
                      {item.sentBy && (
                        <span className="text-[var(--text-muted)] ml-2 text-[10px] font-semibold">by {item.sentBy}</span>
                      )}
                      <p className="text-[var(--text-secondary)] mt-1 leading-normal font-medium">{item.message}</p>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold whitespace-nowrap ml-3">
                      {new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Data Management & Diagnostics */}
        <div className="space-y-6">
          
          {/* Data Management Box */}
          <div className="card p-6 border border-[var(--border)] bg-white rounded-2xl shadow-2xs space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2 text-[var(--text-primary)]">
              <Database className="w-4.5 h-4.5 text-[var(--crimson)]" /> Data Export & Resets
            </h3>
            
            <p className="text-xs text-[var(--text-secondary)] leading-normal">
              Trigger download checkpoints or perform destructive resets. Note that some resets cannot be undone.
            </p>

            <div className="space-y-2 pt-2">
              {/* Backup download */}
              <a
                href="/api/admin/backup"
                className="w-full py-2.5 border border-[var(--border)] hover:bg-[var(--surface-alt)] text-[var(--text-secondary)] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 bg-white shadow-3xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </a>

              {/* Upload Backup */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingBackup}
                className="w-full py-2.5 border border-[var(--border)] hover:bg-[var(--surface-alt)] text-[var(--text-secondary)] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 bg-white shadow-3xs"
              >
                {isUploadingBackup ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Import JSON Backup</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadBackup}
                accept=".json"
                className="hidden"
              />

              {/* Re-seed Dataset */}
              <button
                onClick={handleReseedData}
                disabled={actionLoading !== null}
                className="w-full py-2.5 border border-dashed border-red-300 hover:border-red-500 hover:bg-red-50/50 text-red-600 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 bg-white"
              >
                {actionLoading === "seed" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
                )}
                <span>Wipe & Re-seed Demo Data</span>
              </button>

              {/* Nuclear Reset Event */}
              <button
                onClick={() => setShowResetModal(true)}
                disabled={actionLoading !== null}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Simulation Data</span>
              </button>
            </div>
          </div>

          {/* Presentation Toggle Box */}
          <div className="card p-6 border border-[var(--border)] bg-gradient-to-br from-white to-[var(--surface-alt)]/30 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--crimson)]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Demo Presentation Mode
                </h3>
              </div>
              <Badge variant={event.demoMode ? "success" : "outline"} size="sm">
                {event.demoMode ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6 font-medium">
              Demo mode injects pre-filled verification requests, sponsor leads, and revenue metrics for walkthroughs.
            </p>

            <button
              onClick={handleToggleDemo}
              disabled={actionLoading !== null}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors border shadow-3xs disabled:opacity-60 ${
                event.demoMode
                  ? "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                  : "bg-[var(--crimson)] text-white border-[var(--crimson)] hover:bg-[var(--crimson-dark)]"
              }`}
            >
              {actionLoading === "toggle_demo" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>
                {event.demoMode
                  ? "Disable Presentation Mode"
                  : "Enable Presentation Mode"}
              </span>
            </button>
          </div>

          {/* Infrastructure Health Status */}
          <div className="card p-6 border border-[var(--border)] bg-white rounded-2xl shadow-2xs space-y-3">
            <h3 className="font-extrabold text-sm flex items-center gap-2 text-[var(--text-primary)]">
              <Activity className="w-4.5 h-4.5 text-green-600 animate-pulse" /> Infrastructure Health
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-[var(--surface-alt)]/60 font-semibold border border-[var(--border)]">
                <span>Database Connectivity</span>
                <span className="text-green-600 font-bold">● Operational</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[var(--surface-alt)]/60 font-semibold border border-[var(--border)]">
                <span>Atomic Scoring Engine</span>
                <span className="text-green-600 font-bold">● Active & Synced</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[var(--surface-alt)]/60 font-semibold border border-[var(--border)]">
                <span>NextAuth Provider</span>
                <span className="text-green-600 font-bold">● Active & Synced</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[var(--surface-alt)]/60 font-semibold border border-[var(--border)]">
                <span>Active Simulation Day</span>
                <span className="text-[var(--crimson)] font-black">Day {event.currentDay} / {event.totalDays}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="card p-6 border border-[var(--border)] bg-white rounded-2xl shadow-2xs space-y-3">
            <h3 className="font-extrabold text-sm flex items-center gap-2 text-[var(--text-primary)]">
              <Zap className="w-4.5 h-4.5 text-[var(--crimson)]" /> Navigation Shortcuts
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/deals"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--surface-alt)]/60 hover:bg-[var(--crimson-pale)]/50 border border-[var(--border)] hover:border-[var(--crimson)]/20 group transition-all text-xs font-bold"
              >
                <span>Deal Verification Queue</span>
                <span className="text-[var(--crimson)] font-bold group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--surface-alt)]/60 hover:bg-[var(--crimson-pale)]/50 border border-[var(--border)] hover:border-[var(--crimson)]/20 group transition-all text-xs font-bold"
              >
                <span>User Directory & Staff Directory</span>
                <span className="text-[var(--crimson)] font-bold group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reset Modal ──────────────────────────────────────────────────────── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowResetModal(false)} />
          <div className="relative bg-white border border-[var(--border)] rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Destructive Reset Confirmation</h3>
            </div>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6 font-semibold">
              Warning: Resetting deletes all simulated Deals, Scores, Announcements, Notifications, Awards, and Messages. Participant user accounts and team structures are preserved, but their scores are reset to 0. 
              <br /><br />
              Please type <strong className="text-red-600 font-black font-mono">RESET</strong> to execute this action.
            </p>

            <input
              type="text"
              required
              placeholder="RESET"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="w-full px-3.5 py-2 border border-[var(--border)] rounded-xl text-xs bg-[var(--surface-alt)] font-bold text-center focus:outline-none focus:ring-1 focus:ring-red-500 mb-6 font-mono"
            />

            <div className="flex items-center justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText("");
                }}
                className="px-4 py-2 border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] transition-colors bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetEvent}
                disabled={resetConfirmText.toUpperCase() !== "RESET"}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                Reset Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Restore Snapshot Modal ──────────────────────────────────────────────── */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowRestoreModal(null)} />
          <div className="relative bg-white border border-[var(--border)] rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-rose-600 mb-4">
              <RotateCcw className="w-6 h-6" />
              <h3 className="text-lg font-bold">Restore Point Rollback</h3>
            </div>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6 font-semibold">
              Warning: Restoring will overwrite all current database tables with the states cached inside this snapshot. 
              <br /><br />
              To confirm this action, please re-type the Snapshot ID below:
              <br />
              <strong className="text-[10px] text-[var(--text-muted)] font-mono select-all bg-[var(--surface-alt)] p-1 rounded inline-block mt-2">{showRestoreModal}</strong>
            </p>

            <input
              type="text"
              required
              placeholder="Paste snapshot ID here..."
              value={restoreConfirmText}
              onChange={(e) => setRestoreConfirmText(e.target.value)}
              className="w-full px-3.5 py-2 border border-[var(--border)] rounded-xl text-xs bg-[var(--surface-alt)] font-bold focus:outline-none focus:ring-1 focus:ring-rose-500 mb-6 font-mono"
            />

            <div className="flex items-center justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setShowRestoreModal(null);
                  setRestoreConfirmText("");
                }}
                className="px-4 py-2 border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] transition-colors bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRestoreSnapshot(showRestoreModal)}
                disabled={restoreConfirmText !== showRestoreModal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                Rollback State
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
