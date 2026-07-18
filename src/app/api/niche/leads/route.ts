import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";

/**
 * GET /api/niche/leads
 * Returns the pre-qualified lead list for the calling user's team niche.
 * Participants only see leads assigned to their niche.
 * Admin/Organizer can see all leads.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { User, Lead, Team } = await import("@/models");
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    let leads: any[] = [];

    if (["admin", "organizer"].includes(userRole)) {
      // Admin/organizer sees all leads
      leads = await Lead.find({}).lean();
    } else {
      // Participant — fetch their team's nicheId then filter leads by it
      const user = await User.findById(userId).select("teamId nicheId").lean();
      const nicheId = (user as any)?.nicheId;

      if (!nicheId) {
        // If user has no nicheId, try to get it from their team
        const teamId = (user as any)?.teamId;
        if (teamId) {
          const team = await Team.findById(teamId).select("nicheId").lean();
          const teamNicheId = (team as any)?.nicheId;
          if (teamNicheId) {
            leads = await Lead.find({ nicheId: teamNicheId }).lean();
          } else {
            leads = [];
          }
        } else {
          leads = [];
        }
      } else {
        leads = await Lead.find({ nicheId }).lean();
      }
    }

    return NextResponse.json({ leads });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/niche/leads
 * Claim a lead for your team — persists the claim to DB so other teams see it as claimed.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    await dbConnect();

    const { User, Lead, Team } = await import("@/models");
    const userId = (session.user as any).id;

    const user = await User.findById(userId).select("teamId").lean();
    const teamId = (user as any)?.teamId;

    if (!teamId) {
      return NextResponse.json({ error: "You must be assigned to a team to claim leads" }, { status: 400 });
    }

    // Atomic claim: only update if it is NOT claimed by another team
    const lead = await Lead.findOneAndUpdate(
      {
        _id: leadId,
        $or: [
          { assignedTeamId: null },
          { assignedTeamId: { $exists: false } },
          { assignedTeamId: teamId }, // Already claimed by us
        ],
      },
      {
        $set: {
          status: "claimed",
          assignedTeamId: teamId,
          claimedByUserId: userId,
        },
      },
      { new: true }
    );

    if (!lead) {
      // If we couldn't find/update it, it either doesn't exist or was claimed by someone else
      const existingLead = await Lead.findById(leadId).select("assignedTeamId").lean();
      if (!existingLead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      
      const claimingTeam = await Team.findById((existingLead as any).assignedTeamId).select("name").lean();
      return NextResponse.json(
        {
          error: `This lead is already claimed by ${(claimingTeam as any)?.name ?? "another team"}`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: "Lead claimed successfully", lead });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
