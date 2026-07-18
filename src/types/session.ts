/**
 * Typed session user augmentation for next-auth.
 * Import SessionUser anywhere you need typed access to the logged-in user.
 */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "participant" | "admin" | "judge" | "organizer";
  participantRole?: "deal_architect" | "project_manager" | "developer" | "designer" | "wildcard";
  teamId?: string;
  nicheId?: string;
  eventId?: string;
}

/**
 * Type-safe helper to extract session user from a next-auth session object.
 * Falls back gracefully for unauthenticated requests.
 */
export function getSessionUser(session: any): SessionUser | null {
  if (!session?.user) return null;
  return session.user as SessionUser;
}

/** Get user initials (max 2 chars) from a name string */
export function getUserInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Get the display label for a role */
export function getRoleDisplayLabel(user: SessionUser): string {
  switch (user.role) {
    case "organizer":
      return "👑 GWD CEO & Organizer";
    case "admin":
      return "🛡️ GWD Verification Officer";
    case "judge":
      return "⚖️ CII CIES Chair";
    default:
      return user.participantRole === "deal_architect"
        ? "Deal Architect (Captain)"
        : user.participantRole === "project_manager"
        ? "Project Manager"
        : user.participantRole === "developer"
        ? "Developer"
        : user.participantRole === "designer"
        ? "Designer"
        : "Participant";
  }
}

/** Get the short role tag for header display */
export function getRoleShortTag(user: SessionUser): string {
  switch (user.role) {
    case "organizer": return "👑 CEO Pasha";
    case "admin":     return "🛡️ Admin Officer";
    case "judge":     return "⚖️ Judge Panel Chair";
    default:
      return user.participantRole === "deal_architect" ? "Captain (DA)"
           : user.participantRole === "project_manager" ? "Project Manager"
           : "Participant";
  }
}
