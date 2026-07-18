"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useUserRole } from "@/hooks/useUserRole";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import {
  useTeamMessages,
  useBroadcastMessages,
  useStaffMessages,
  useTeams,
  useEvent,
  useTeam,
} from "@/hooks/useData";
import { apiMutate } from "@/lib/api-client";
import {
  Users,
  Send,
  Inbox,
  Loader2,
  Swords,
  Radio,
  Lock,
  ChevronRight,
  Shield,
  Crown,
  Gavel,
  Trophy,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeFormat(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSenderBadge(msg: any) {
  const role = msg.senderRole || msg.userId?.role;
  if (role === "organizer") return { label: "CEO", icon: Crown, color: "bg-violet-600 text-white" };
  if (role === "admin") return { label: "GWD Admin", icon: Shield, color: "bg-[var(--crimson)] text-white" };
  if (role === "judge") return { label: "Judge", icon: Gavel, color: "bg-amber-600 text-white" };
  return null;
}

function getInitials(name: string) {
  return name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2) || "?";
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, isMe }: { msg: any; isMe: boolean }) {
  const senderName =
    msg.userId?.name ||
    msg.senderName ||
    (msg.isStaffMessage ? "GWD Staff" : "Participant");
  const initials = getInitials(senderName);
  const staffBadge = getSenderBadge(msg);
  const isStaff = msg.isStaffMessage;

  return (
    <div className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
          isStaff
            ? "bg-[var(--crimson)] text-white ring-2 ring-[var(--crimson)]/30"
            : isMe
            ? "bg-[var(--crimson)] text-white"
            : "bg-[var(--surface-alt)] text-[var(--text-secondary)] border border-[var(--border)]"
        )}
      >
        {initials}
      </div>

      <div className={cn("max-w-[75%]", isMe ? "text-right" : "")}>
        {/* Name + badge + time */}
        <div className={cn("flex items-center gap-2 mb-1 flex-wrap", isMe ? "justify-end" : "")}>
          <span className="text-xs font-bold text-[var(--text-primary)]">
            {senderName}
          </span>
          {staffBadge && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full",
                staffBadge.color
              )}
            >
              <staffBadge.icon className="w-2.5 h-2.5" />
              {staffBadge.label}
            </span>
          )}
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            {msg.createdAt ? timeFormat(msg.createdAt) : ""}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={cn(
            "inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isStaff && !isMe
              ? "bg-[var(--crimson)]/10 text-[var(--text-primary)] border border-[var(--crimson)]/25 rounded-bl-md"
              : isMe
              ? "bg-[var(--crimson)] text-white rounded-br-md"
              : "bg-[var(--surface-alt)] text-[var(--text-primary)] border border-[var(--border)] rounded-bl-md"
          )}
        >
          {msg.content}
        </div>
      </div>
    </div>
  );
}

// ─── Chat panel (reused across channels) ─────────────────────────────────────

function ChatPanel({
  messages,
  isLoading,
  currentUserName,
  onSend,
  canSend,
  placeholder,
  emptyLabel,
}: {
  messages: any[];
  isLoading: boolean;
  currentUserName: string;
  onSend: (text: string) => Promise<void>;
  canSend: boolean;
  placeholder?: string;
  emptyLabel?: string;
}) {
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!newMsg.trim() || sending || !canSend) return;
    setSending(true);
    await onSend(newMsg.trim());
    setNewMsg("");
    setSending(false);
  };

  return (
    <div
      className="card-glass overflow-hidden border border-[var(--border)] flex flex-col"
      style={{ height: "calc(100vh - 280px)", minHeight: "380px" }}
    >
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Inbox className="w-12 h-12 text-[var(--text-muted)] mb-3" />
            <h3 className="font-bold text-lg text-[var(--text-secondary)] font-display">
              {emptyLabel || "No messages yet"}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {canSend ? "Be the first to send a message." : "Messages will appear here."}
            </p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.userId?.name === currentUserName;
            return <MessageBubble key={msg._id} msg={msg} isMe={isMe} />;
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] p-3 bg-[var(--surface-card)]">
        {canSend ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={placeholder || "Type a message…"}
              className="flex-1 px-4 py-2.5 min-h-[44px] bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--crimson)]/30 transition-all"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!newMsg.trim() || sending}
              aria-label="Send message"
              aria-disabled={!newMsg.trim() || sending}
              className="p-3 min-h-[44px] min-w-[44px] rounded-xl bg-[var(--crimson)] text-white hover:bg-[var(--crimson-dark)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-95"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        ) : (
          <div className="text-center text-xs text-[var(--text-muted)] py-2 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Read-only — you cannot post in this channel
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Staff Command Center ─────────────────────────────────────────────────────

type StaffTab = "team" | "broadcast" | "staff";

function StaffCommandCenter({
  name,
  role,
  event,
}: {
  name: string;
  role: string;
  event: any;
}) {
  const { toast } = useToast();
  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const teams = teamsData?.teams || [];

  const [activeTab, setActiveTab] = useState<StaffTab>("team");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Auto-select and persist selected team in localStorage
  useEffect(() => {
    if (teams.length === 0) return;
    const saved = typeof window !== "undefined" ? localStorage.getItem("gwd_warroom_team_id") : null;
    if (saved && teams.some((t: any) => t._id?.toString() === saved)) {
      if (selectedTeamId !== saved) setSelectedTeamId(saved);
    } else if (!selectedTeamId) {
      const firstId = teams[0]._id?.toString() ?? null;
      if (firstId) {
        setSelectedTeamId(firstId);
        if (typeof window !== "undefined") {
          localStorage.setItem("gwd_warroom_team_id", firstId);
        }
      }
    }
  }, [teams, selectedTeamId]);

  const handleTeamSelect = (id: string) => {
    setSelectedTeamId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("gwd_warroom_team_id", id);
    }
  };

  const canPostToTeam = role === "admin" || role === "organizer";
  const canBroadcast = role === "admin" || role === "organizer";
  const canPostToStaff = true; // all staff can post to staff briefing

  // Per-channel data — always fetch team messages for selectedTeamId regardless of active tab
  // so the SWR key never becomes null mid-session (prevents cache invalidation on tab switch)
  const {
    data: teamMsgData,
    isLoading: teamMsgLoading,
    mutate: mutateTeam,
  } = useTeamMessages(selectedTeamId, "team");

  const {
    data: broadcastData,
    isLoading: broadcastLoading,
    mutate: mutateBroadcast,
  } = useBroadcastMessages();

  const {
    data: staffData,
    isLoading: staffLoading,
    mutate: mutateStaff,
  } = useStaffMessages();

  const activeMessages = useMemo(() => {
    if (activeTab === "team") return teamMsgData?.messages || [];
    if (activeTab === "broadcast") return broadcastData?.messages || [];
    return staffData?.messages || [];
  }, [activeTab, teamMsgData, broadcastData, staffData]);

  const activeLoading =
    activeTab === "team"
      ? teamMsgLoading
      : activeTab === "broadcast"
      ? broadcastLoading
      : staffLoading;

  const handleSend = async (text: string) => {
    const targetTeamId = selectedTeamId || (teams[0]?._id?.toString() ?? undefined);
    const body: Record<string, string> = { message: text, channel: activeTab };
    if (activeTab === "team" && targetTeamId) body.teamId = targetTeamId;

    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      content: text,
      channel: activeTab,
      teamId: selectedTeamId,
      createdAt: new Date().toISOString(),
      senderRole: role,
      isStaffMessage: true,
      userId: { name, role },
    };

    // Pick the right mutate for the active channel
    const activeMutate = activeTab === "team" ? mutateTeam
      : activeTab === "broadcast" ? mutateBroadcast
      : mutateStaff;

    // Step 1: show optimistic message immediately
    activeMutate(
      (prev: any) => ({ ...prev, messages: [...(prev?.messages || []), optimisticMsg] }),
      { revalidate: false }
    );

    // Step 2: POST to server
    const { data, error } = await apiMutate<{ message: any }>("/api/team-messages", { body });

    if (error) {
      toast.error(`Failed to send: ${error}`);
      // Revert: remove the optimistic message
      activeMutate(
        (prev: any) => ({
          ...prev,
          messages: (prev?.messages || []).filter((m: any) => m._id !== tempId),
        }),
        { revalidate: false }
      );
      return;
    }

    // Step 3: swap temp message with real server message (no refetch needed)
    const realMsg = (data as any)?.message;
    activeMutate(
      (prev: any) => ({
        ...prev,
        messages: (prev?.messages || []).map((m: any) =>
          m._id === tempId ? (realMsg ?? m) : m
        ),
      }),
      { revalidate: false }
    );
  };

  const tabs: { id: StaffTab; label: string; icon: any; desc: string }[] = [
    { id: "team", label: "Team Channels", icon: Swords, desc: "Monitor & coach teams" },
    { id: "broadcast", label: "📢 Broadcast", icon: Radio, desc: "All-teams announcement" },
    { id: "staff", label: "🔒 Staff Briefing", icon: Lock, desc: "Internal coordination" },
  ];

  const selectedTeam = teams.find((t: any) => t._id?.toString() === selectedTeamId);

  const canSendInActiveTab =
    (activeTab === "team" && canPostToTeam) ||
    (activeTab === "broadcast" && canBroadcast) ||
    (activeTab === "staff" && canPostToStaff);

  const placeholders: Record<StaffTab, string> = {
    team: `Coach ${selectedTeam?.name || "this team"} as GWD Staff…`,
    broadcast: "Send an announcement to ALL participants…",
    staff: "Internal staff note (participants cannot see this)…",
  };

  return (
    <DashboardLayout title="Command Center" breadcrumbs={["Home", "War Room", "Command Center"]}>
      <div className="animate-slide-up">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display flex items-center gap-3">
            <Shield className="w-7 h-7 text-[var(--crimson)]" />
            GWD Command Center
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Day {event?.currentDay || 1} of {event?.totalDays || 9} · {teams.length} teams active
          </p>
        </div>

        {/* Channel tab bar */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-[var(--crimson)] text-white shadow-md"
                  : "bg-[var(--surface-alt)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-5">
          {/* Left: Team list (only visible in team tab) */}
          {activeTab === "team" && (
            <div className="card p-0 overflow-hidden border border-[var(--border)]">
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-alt)]">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {teamsLoading ? "Loading…" : `${teams.length} Teams`}
                </p>
              </div>
              <div
                className="overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 380px)", minHeight: "200px" }}
              >
                {teamsLoading ? (
                  <div className="p-3 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  teams.map((team: any) => {
                    const isSelected = team._id?.toString() === selectedTeamId;
                    return (
                      <button
                        key={team._id}
                        onClick={() => handleTeamSelect(team._id?.toString())}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-[var(--border)]/50 hover:bg-[var(--surface-alt)] active:scale-[0.98]",
                          isSelected ? "bg-[var(--crimson-pale)] border-l-2 border-l-[var(--crimson)]" : ""
                        )}
                      >
                        <span className="text-xl flex-shrink-0">{team.emoji || "🏢"}</span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-bold truncate",
                              isSelected ? "text-[var(--crimson)]" : "text-[var(--text-primary)]"
                            )}
                          >
                            {team.name}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                            <Trophy className="w-2.5 h-2.5" />
                            {team.totalScore || 0} pts
                            <span className="mx-1">·</span>
                            <Users className="w-2.5 h-2.5" />
                            {team.memberIds?.length || 0}
                          </p>
                        </div>
                        {isSelected && (
                          <ChevronRight className="w-4 h-4 text-[var(--crimson)] flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Right: Chat panel */}
          <div className="flex flex-col">
            {/* Channel context header */}
            <div className="mb-3 flex items-center justify-between">
              <div>
                {activeTab === "team" && selectedTeam && (
                  <h2 className="font-bold text-base flex items-center gap-2">
                    {selectedTeam.emoji} {selectedTeam.name}
                    <span className="text-xs font-normal text-[var(--text-muted)]">War Room</span>
                  </h2>
                )}
                {activeTab === "broadcast" && (
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[var(--crimson)]" />
                    All-Teams Broadcast
                    <span className="text-xs font-normal text-[var(--text-muted)]">Visible to all participants</span>
                  </h2>
                )}
                {activeTab === "staff" && (
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    Staff Briefing
                    <span className="text-xs font-normal text-[var(--text-muted)]">Admin · CEO · Judge only</span>
                  </h2>
                )}
              </div>
              {activeTab === "team" && canPostToTeam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-[var(--crimson)] text-white rounded-full">
                  <Zap className="w-2.5 h-2.5" />
                  Posting as GWD Staff
                </span>
              )}
            </div>

            <ChatPanel
              messages={activeMessages}
              isLoading={activeLoading}
              currentUserName={name}
              onSend={handleSend}
              canSend={canSendInActiveTab}
              placeholder={placeholders[activeTab]}
              emptyLabel={
                activeTab === "broadcast"
                  ? "No broadcasts yet"
                  : activeTab === "staff"
                  ? "No staff messages yet"
                  : "No messages in this team yet"
              }
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Participant War Room ─────────────────────────────────────────────────────

function ParticipantWarRoom({ name, teamId }: { name: string; teamId: string }) {
  const { toast } = useToast();
  const { data: msgData, isLoading, mutate } = useTeamMessages(teamId, "team");
  const { data: broadcastData } = useBroadcastMessages();
  const { data: teamData } = useTeam(teamId);
  const { data: eventData } = useEvent();

  const [activeTab, setActiveTab] = useState<"team" | "broadcast">("team");

  const team = teamData?.team;
  const event = eventData?.event;

  const teamMessages = msgData?.messages || [];
  const broadcastMessages = broadcastData?.messages || [];
  const activeMessages = activeTab === "team" ? teamMessages : broadcastMessages;
  const activeLoading = activeTab === "team" ? isLoading : false;

  const handleSend = async (text: string) => {
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      content: text,
      channel: "team",
      teamId,
      createdAt: new Date().toISOString(),
      senderRole: "participant",
      isStaffMessage: false,
      userId: { name },
    };

    // Step 1: show message immediately
    mutate(
      (prev: any) => ({ ...prev, messages: [...(prev?.messages || []), optimisticMsg] }),
      { revalidate: false }
    );

    // Step 2: POST to server
    const { data, error } = await apiMutate<{ message: any }>("/api/team-messages", {
      body: { teamId, message: text, channel: "team" },
    });

    if (error) {
      toast.error(`Failed to send: ${error}`);
      // Revert optimistic message
      mutate(
        (prev: any) => ({
          ...prev,
          messages: (prev?.messages || []).filter((m: any) => m._id !== tempId),
        }),
        { revalidate: false }
      );
      return;
    }

    // Step 3: swap temp with real server message (no refetch)
    const realMsg = (data as any)?.message;
    mutate(
      (prev: any) => ({
        ...prev,
        messages: (prev?.messages || []).map((m: any) =>
          m._id === tempId ? (realMsg ?? m) : m
        ),
      }),
      { revalidate: false }
    );
  };

  return (
    <DashboardLayout title="War Room" breadcrumbs={["Home", "War Room"]}>
      <div className="animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold font-display flex items-center gap-3">
              {team?.emoji || "🏢"} {team?.name || "Team"} War Room
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Day {event?.currentDay || 1} · {team?.memberIds?.length || 0} members · {team?.totalScore || 0} pts
            </p>
          </div>
        </div>

        {/* Tabs: Team | Broadcast */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("team")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              activeTab === "team"
                ? "bg-[var(--crimson)] text-white shadow-md"
                : "bg-[var(--surface-alt)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
            )}
          >
            <Swords className="w-4 h-4" />
            Team Chat
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              activeTab === "broadcast"
                ? "bg-[var(--crimson)] text-white shadow-md"
                : "bg-[var(--surface-alt)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
            )}
          >
            <Radio className="w-4 h-4" />
            Broadcasts
            {broadcastMessages.length > 0 && (
              <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] font-mono">
                {broadcastMessages.length}
              </span>
            )}
          </button>
        </div>

        <ChatPanel
          messages={activeMessages}
          isLoading={activeLoading}
          currentUserName={name}
          onSend={handleSend}
          canSend={activeTab === "team"}
          placeholder="Coordinate with your team…"
          emptyLabel={
            activeTab === "team"
              ? "Start the conversation!"
              : "No broadcasts from GWD yet"
          }
        />
      </div>
    </DashboardLayout>
  );
}

// ─── Root page — routes by role ───────────────────────────────────────────────

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

export default function WarRoomPage() {
  const { name, role, teamId, isOrganizer, isAdmin, isJudge } = useUserRole();
  const { data: session, update: updateSession } = useSession();
  const { data: eventData } = useEvent();
  const event = eventData?.event;
  const isStaff = isOrganizer || isAdmin || isJudge;

  // ── Session self-heal ──────────────────────────────────────────────────────
  // If the current session has a stale demo string ID, trigger a session update
  // which causes NextAuth to re-run the jwt callback and write a fresh cookie.
  useEffect(() => {
    const sessionId = (session?.user as any)?.id as string | undefined;
    if (sessionId && !OBJECT_ID_REGEX.test(sessionId)) {
      console.warn("[WarRoom] Stale session ID detected — triggering session refresh");
      updateSession(); // fires jwt callback with trigger="update" → heals + re-saves cookie
    }
  }, [session, updateSession]);

  if (isStaff) {
    return (
      <StaffCommandCenter
        name={name}
        role={role}
        event={event}
      />
    );
  }

  if (!teamId) {
    return (
      <DashboardLayout title="War Room" breadcrumbs={["Home", "War Room"]}>
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="font-bold text-lg font-display">No Team Assigned</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            You need to be assigned to a team to access the War Room.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return <ParticipantWarRoom name={name} teamId={teamId} />;
}
