import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";
import EventSnapshot from "@/models/EventSnapshot";
import User from "@/models/User";
import Team from "@/models/Team";
import Deal from "@/models/Deal";
import TeamMessage from "@/models/TeamMessage";
import Lead from "@/models/Lead";
import Score from "@/models/Score";
import Event from "@/models/Event";
import Niche from "@/models/Niche";
import DailyBriefing from "@/models/DailyBriefing";
import Notification from "@/models/Notification";
import JudgeReview from "@/models/JudgeReview";
import Award from "@/models/Award";
import ClientContact from "@/models/ClientContact";
import { auth } from "@/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !["admin", "organizer"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden — Admin / Organizer access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { confirmToken } = body;

    if (confirmToken !== id) {
      return NextResponse.json({ error: "Invalid confirmation token" }, { status: 400 });
    }

    await dbConnect();

    const snapshot = await EventSnapshot.findById(id);
    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }

    const {
      events = [],
      users = [],
      teams = [],
      deals = [],
      messages = [],
      leads = [],
      scores = [],
      notifications = [],
      dailyBriefings = [],
      judgeReviews = [],
      awards = [],
      clientContacts = [],
      niches = [],
    } = snapshot.snapshotData;

    // Preserve existing password hashes of current users to avoid locking them out
    const existingUsers = await User.find({}).select("email password").lean();
    const passwordMap = new Map<string, string>();
    for (const u of existingUsers) {
      if (u.email && u.password) {
        passwordMap.set(u.email.toLowerCase(), u.password);
      }
    }

    // Default fallback password hash for "BizSim2026"
    const defaultHashedPassword = await bcrypt.hash("BizSim2026", 10);

    // Prepare restored users list
    const preparedUsers = users.map((u: any) => {
      const emailLower = u.email ? u.email.toLowerCase() : "";
      const password = passwordMap.get(emailLower) || defaultHashedPassword;
      return {
        ...u,
        password,
      };
    });

    // Destructive drop of all 13 collections
    await Promise.all([
      Event.deleteMany({}),
      User.deleteMany({}),
      Team.deleteMany({}),
      Deal.deleteMany({}),
      TeamMessage.deleteMany({}),
      Lead.deleteMany({}),
      Score.deleteMany({}),
      Notification.deleteMany({}),
      DailyBriefing.deleteMany({}),
      JudgeReview.deleteMany({}),
      Award.deleteMany({}),
      ClientContact.deleteMany({}),
      Niche.deleteMany({}),
    ]);

    // Restore data with insertMany
    await Promise.all([
      events.length ? Event.insertMany(events, { ordered: false }) : Promise.resolve(),
      preparedUsers.length ? User.insertMany(preparedUsers, { ordered: false }) : Promise.resolve(),
      teams.length ? Team.insertMany(teams, { ordered: false }) : Promise.resolve(),
      deals.length ? Deal.insertMany(deals, { ordered: false }) : Promise.resolve(),
      messages.length ? TeamMessage.insertMany(messages, { ordered: false }) : Promise.resolve(),
      leads.length ? Lead.insertMany(leads, { ordered: false }) : Promise.resolve(),
      scores.length ? Score.insertMany(scores, { ordered: false }) : Promise.resolve(),
      notifications.length ? Notification.insertMany(notifications, { ordered: false }) : Promise.resolve(),
      dailyBriefings.length ? DailyBriefing.insertMany(dailyBriefings, { ordered: false }) : Promise.resolve(),
      judgeReviews.length ? JudgeReview.insertMany(judgeReviews, { ordered: false }) : Promise.resolve(),
      awards.length ? Award.insertMany(awards, { ordered: false }) : Promise.resolve(),
      clientContacts.length ? ClientContact.insertMany(clientContacts, { ordered: false }) : Promise.resolve(),
      niches.length ? Niche.insertMany(niches, { ordered: false }) : Promise.resolve(),
    ]);

    // Clear caches
    try {
      const { clearLeaderboardCache } = await import("@/app/api/leaderboard/route");
      clearLeaderboardCache();
    } catch (e) {
      console.error("Failed to clear leaderboard cache during snapshot restore:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Snapshot '${snapshot.name}' restored successfully`,
      summary: {
        eventsRestored: events.length,
        usersRestored: preparedUsers.length,
        teamsRestored: teams.length,
        dealsRestored: deals.length,
        messagesRestored: messages.length,
        leadsRestored: leads.length,
        scoresRestored: scores.length,
        notificationsRestored: notifications.length,
        dailyBriefingsRestored: dailyBriefings.length,
        judgeReviewsRestored: judgeReviews.length,
        awardsRestored: awards.length,
        clientContactsRestored: clientContacts.length,
        nichesRestored: niches.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Restore failed";
    console.error("Restore snapshot endpoint error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
