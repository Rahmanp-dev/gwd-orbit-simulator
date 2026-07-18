import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Placed here as placeholder; credential providers will be added in Node.js auth.ts
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.participantRole = (user as any).participantRole;
        token.teamId = (user as any).teamId ?? "";
        token.nicheId = (user as any).nicheId ?? "";
        token.eventId = (user as any).eventId ?? "";
        token.name = (user as any).name;
        token.suspended = (user as any).suspended ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).name = token.name;
        (session.user as any).role = token.role;
        (session.user as any).participantRole = token.participantRole;
        (session.user as any).teamId = token.teamId ?? "";
        (session.user as any).nicheId = token.nicheId ?? "";
        (session.user as any).eventId = token.eventId ?? "";
        (session.user as any).suspended = token.suspended ?? false;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
