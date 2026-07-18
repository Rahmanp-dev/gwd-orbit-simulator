import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const pwd = credentials.password as string;

        try {
          await dbConnect();

          let user = await User.findOne({ email });

          // Auto-seed key demo users if missing
          if (!user && (email === "organizer@gwd.global" || email === "admin@gwd.global" || email === "judge@gwd.global" || email === "arjun@gwd.global")) {
            const hashedPw = await bcrypt.hash("BizSim2026", 10);
            const role = email === "organizer@gwd.global" ? "organizer" : email === "admin@gwd.global" ? "admin" : email === "judge@gwd.global" ? "judge" : "participant";
            const name = email === "organizer@gwd.global" ? "Mohd Abdul Rahman Pasha (CEO)" : email === "admin@gwd.global" ? "Lead Verification Officer" : email === "judge@gwd.global" ? "CII CIES Evaluation Chair" : "Arjun Reddy";

            user = await User.create({
              email,
              password: hashedPw,
              name,
              role,
              participantRole: role === "participant" ? "deal_architect" : "wildcard",
              orbitScore: 0,
              tier: role === "organizer" ? "partner" : "member",
              onboardingComplete: true,
              onboardingStep: 5,
            });
          }

          if (!user) return null;

          if (user.suspended) {
            throw new Error("Your account is suspended. Please contact the administrator.");
          }

          if (!user.password) return null;
          const isValid = await bcrypt.compare(pwd, user.password);
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            participantRole: user.participantRole,
            image: user.avatar ?? "",
            teamId: user.teamId?.toString() ?? "",
            nicheId: user.nicheId?.toString() ?? "",
            eventId: user.eventId?.toString() ?? "",
            suspended: user.suspended ?? false,
          };
        } catch (error) {
          console.error("[Auth] authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // Apply base user mappings first
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

      // Live database role/team sync (Node.js runtime only)
      if (token.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email })
            .select("_id role participantRole teamId nicheId eventId name suspended")
            .lean() as any;

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.participantRole = dbUser.participantRole;
            token.teamId = dbUser.teamId?.toString() ?? "";
            token.nicheId = dbUser.nicheId?.toString() ?? "";
            token.eventId = dbUser.eventId?.toString() ?? "";
            token.name = dbUser.name;
            token.suspended = dbUser.suspended ?? false;
          }
        } catch (err) {
          console.error("[Auth] JWT database sync error:", err);
        }
      }

      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});
