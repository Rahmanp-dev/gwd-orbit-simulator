"use client";

import { useSession } from "next-auth/react";
import type { SessionUser } from "@/types/session";
import { getUserInitials, getRoleDisplayLabel, getRoleShortTag } from "@/types/session";

/**
 * useUserRole — Custom hook to access the current user's identity from session.
 *
 * Replaces the repeated (session?.user as any)?.role pattern across
 * Sidebar, Header, DashboardLayout, team page, and others.
 *
 * @returns typed user info, loading state, and display helpers
 */
export function useUserRole() {
  const { data: session, status } = useSession();

  const user = session?.user as SessionUser | undefined;

  const role = user?.role ?? "participant";
  const participantRole = user?.participantRole ?? "deal_architect";
  const name = user?.name ?? "Guest";
  const email = user?.email ?? "";
  const id = user?.id ?? "";
  const initials = getUserInitials(name);

  const isOrganizer = role === "organizer";
  const isAdmin = role === "admin";
  const isJudge = role === "judge";
  const isParticipant = role === "participant";
  const isStaff = isOrganizer || isAdmin;

  const teamId = user?.teamId ?? "";
  const nicheId = user?.nicheId ?? "";

  const displayLabel = user ? getRoleDisplayLabel(user) : "";
  const shortTag = user ? getRoleShortTag(user) : "";

  return {
    // Core identity
    user,
    role,
    participantRole,
    name,
    email,
    id,
    initials,
    teamId,
    nicheId,

    // Role booleans
    isOrganizer,
    isAdmin,
    isJudge,
    isParticipant,
    isStaff,

    // Display helpers
    displayLabel,
    shortTag,

    // Session state
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
