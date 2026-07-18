import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { User, Team, Event, Niche } from "@/models";
import Notification from "@/models/Notification";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password, phone, college, company, linkedin, skills, preferredRole, teamName } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 8 chars)
    if (String(password).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      college,
      company,
      linkedin,
      skills: skills || [],
      participantRole: preferredRole || "deal_architect",
      role: "participant",
      orbitScore: 0,
      tier: "member",
      onboardingComplete: false,
      onboardingStep: 1,
    });

    // Dynamic Team creation/assignment if teamName is provided
    if (teamName) {
      const activeEvent = await Event.findOne({ status: { $in: ["active", "paused", "registration"] } }).sort({ createdAt: -1 });
      const healthcareNiche = await Niche.findOne({ slug: "healthcare" }).sort({ createdAt: -1 });

      if (activeEvent && healthcareNiche) {
        let team = await Team.findOne({ name: teamName });
        if (!team) {
          team = await Team.create({
            name: teamName,
            emoji: "🚀",
            eventId: activeEvent._id,
            nicheId: healthcareNiche._id,
            memberIds: [user._id],
            captainId: user._id,
            totalScore: 0,
            totalRevenue: 0,
            totalDeals: 0,
          });
        } else {
          await Team.findByIdAndUpdate(team._id, {
            $addToSet: { memberIds: user._id }
          });
        }

        await User.findByIdAndUpdate(user._id, {
          $set: {
            teamId: team._id,
            nicheId: healthcareNiche._id,
            eventId: activeEvent._id,
            onboardingComplete: true,
            onboardingStep: 5
          }
        });
        
        user.teamId = team._id;
        user.nicheId = healthcareNiche._id;
        user.eventId = activeEvent._id;
        user.onboardingComplete = true;
        user.onboardingStep = 5;
      }
    }

    // Send welcome notification to new participant
    try {
      await Notification.create({
        userId: user._id,
        eventId: user.eventId,
        type: "system",
        title: "Welcome to GWD Orbit! 🚀",
        message: "Your account is set up. Start by completing your profile, then claim your first lead on the Niche Board. Good luck!",
        link: "/niche",
      });
    } catch {
      // Non-blocking — don't fail registration if notification fails
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { message: "Account created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
