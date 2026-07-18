/**
 * SWR-based data hooks for GWD Orbit Simulator.
 * 
 * Each hook returns { data, error, isLoading, mutate } and leverages
 * SWR's caching, revalidation, and error retry.
 */
"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { swrFetcher } from "@/lib/api-client";

// ─── Shared SWR defaults ──────────────────────────────────────────────────────
// NOTE: revalidateOnFocus is OFF by default. Focus-refetch on every tab switch
// creates DB churn and makes the UI feel jittery. Hooks that benefit from
// freshness (notifications, war-room chat) opt in explicitly via refreshInterval.
const defaults: SWRConfiguration = {
  revalidateOnFocus: false,
  errorRetryCount: 2,
  dedupingInterval: 10000,
  keepPreviousData: true,
};

// ─── Type definitions ─────────────────────────────────────────────────────────

interface DealResponse {
  deals: any[];
  total: number;
}

interface LeaderboardResponse {
  leaderboard: any[];
  type: "team" | "individual";
}

interface EventResponse {
  event: {
    _id: string | null;
    name: string;
    slug: string;
    status: string;
    currentDay: number;
    totalDays: number;
    demoMode: boolean;
    broadcastMessages: any[];
    startDate?: string;
    endDate?: string;
  };
}

interface TeamResponse {
  team: any;
  verifiedDeals: any[];
}

interface UserResponse {
  user: any;
}

interface NotificationsResponse {
  notifications: any[];
  unreadCount: number;
}

interface ScoresResponse {
  scores: any[];
  total: number;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Fetch current user's deals (or all for admin) */
export function useDeals(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR<DealResponse>(`/api/deals${qs}`, swrFetcher, defaults);
}

/** Fetch a single deal by ID */
export function useDeal(id: string | null) {
  return useSWR<{ deal: any }>(id ? `/api/deals/${id}` : null, swrFetcher, defaults);
}

/** Fetch leaderboard (public — no auth needed) */
export function useLeaderboard(type: "team" | "individual" = "team", eventId?: string) {
  const params = new URLSearchParams({ type });
  if (eventId) params.set("eventId", eventId);
  return useSWR<LeaderboardResponse>(
    `/api/leaderboard?${params}`,
    swrFetcher,
    { ...defaults, revalidateOnFocus: false }
  );
}

/** Fetch current event state — used everywhere for day/status awareness */
export function useEvent() {
  return useSWR<EventResponse>("/api/admin/event", swrFetcher, {
    ...defaults,
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  });
}

/** Fetch a team by ID */
export function useTeam(id: string | null) {
  return useSWR<TeamResponse>(id ? `/api/team/${id}` : null, swrFetcher, defaults);
}

/** Fetch current user profile */
export function useMe() {
  return useSWR<UserResponse>("/api/user/me", swrFetcher, {
    ...defaults,
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

/** Fetch notifications for the current user */
export function useNotifications() {
  return useSWR<NotificationsResponse>("/api/notifications", swrFetcher, {
    ...defaults,
    refreshInterval: 30000, // Poll every 30s for new notifications
  });
}

/** Fetch niche leads */
export function useNicheLeads() {
  return useSWR<{ leads: any[]; niche?: any }>("/api/niche/leads", swrFetcher, defaults);
}

/** Fetch score history for the current user */
export function useScores(userId?: string) {
  const param = userId ? `?userId=${userId}` : "";
  return useSWR<ScoresResponse>(`/api/scores${param}`, swrFetcher, defaults);
}

/** Fetch team messages (war room) — supports optional channel param */
export function useTeamMessages(teamId: string | null, channel: string = "team") {
  const key = teamId
    ? `/api/team-messages?teamId=${teamId}&channel=${channel}`
    : channel !== "team"
    ? `/api/team-messages?channel=${channel}`
    : null;
  return useSWR<{ messages: any[]; channel: string }>(
    key,
    swrFetcher,
    { ...defaults, refreshInterval: 6000 } // Poll every 6s for near-realtime
  );
}

/** Fetch broadcast channel messages (staff write, everyone reads) */
export function useBroadcastMessages() {
  return useSWR<{ messages: any[] }>(
    "/api/team-messages?channel=broadcast",
    swrFetcher,
    { ...defaults, refreshInterval: 10000 }
  );
}

/** Fetch staff briefing channel (admin/organizer/judge only) */
export function useStaffMessages() {
  return useSWR<{ messages: any[] }>(
    "/api/team-messages?channel=staff",
    swrFetcher,
    { ...defaults, refreshInterval: 8000 }
  );
}

/** Fetch all teams (for staff command center team picker) */
export function useTeams(eventId?: string) {
  const qs = eventId ? `?eventId=${eventId}` : "";
  return useSWR<{ teams: any[] }>(`/api/teams${qs}`, swrFetcher, {
    ...defaults,
    dedupingInterval: 20000,
  });
}

/** Admin: fetch overview stats */
export function useAdminOverview() {
  return useSWR<any>("/api/admin/overview", swrFetcher, defaults);
}

/** Admin: fetch all users */
export function useAdminUsers() {
  return useSWR<{ users: any[] }>("/api/admin/users", swrFetcher, defaults);
}

/** Organizer: fetch event-wide telemetry */
export function useOrganizerOverview() {
  return useSWR<any>("/api/organizer/overview", swrFetcher, defaults);
}

/** Judge: fetch reviewable submissions */
export function useJudgeReviews() {
  return useSWR<{ submissions: any[] }>("/api/judge/reviews", swrFetcher, defaults);
}
