/**
 * seed-data.ts — Comprehensive seed data for GWD Orbit Simulator.
 *
 * Creates: 4 niches, 1 event, 8 teams (2 per niche), ~30 users,
 * ~40 leads, ~25 deals in varied lifecycle stages, judge reviews,
 * notifications, team messages, daily briefings, and scores.
 *
 * Idempotent: checks if data exists before seeding.
 * Called automatically in memory mode via db.ts.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Event from "@/models/Event";
import Niche from "@/models/Niche";
import Team from "@/models/Team";
import User from "@/models/User";
import Lead from "@/models/Lead";
import Deal from "@/models/Deal";
import Score from "@/models/Score";
import Notification from "@/models/Notification";
import DailyBriefing from "@/models/DailyBriefing";
import TeamMessage from "@/models/TeamMessage";
import JudgeReview from "@/models/JudgeReview";
import Award from "@/models/Award";
import ClientContact from "@/models/ClientContact";

declare global {
  // eslint-disable-next-line no-var
  var _gwdSeedingLock: Promise<any> | undefined;
  // eslint-disable-next-line no-var
  var _gwdSeeded: boolean | undefined;
}

export async function autoSeed(): Promise<void> {
  if (global._gwdSeeded) return;

  if (global._gwdSeedingLock) {
    await global._gwdSeedingLock;
    return;
  }

  global._gwdSeedingLock = (async () => {
    try {
      const existingEvent = await Event.findOne({ slug: "bizsim-2026" });
      if (existingEvent) {
        console.log("[GWD Seed] Data already present — skipping seed.");
        global._gwdSeeded = true;
        return;
      }

      console.log("[GWD Seed] 🌱 Seeding demo data...");
      await seedAllInternal();
      global._gwdSeeded = true;
      console.log("[GWD Seed] ✅ Seed complete.");
    } finally {
      global._gwdSeedingLock = undefined;
    }
  })();

  await global._gwdSeedingLock;
}

export async function seedAll(): Promise<{ message: string }> {
  if (global._gwdSeedingLock) {
    await global._gwdSeedingLock;
  }

  global._gwdSeedingLock = (async () => {
    try {
      console.log("[GWD Seed] 🔄 Clearing existing data for fresh re-seed...");
      await Promise.all([
        Event.deleteMany({}),
        Niche.deleteMany({}),
        Team.deleteMany({}),
        User.deleteMany({}),
        Lead.deleteMany({}),
        Deal.deleteMany({}),
        Score.deleteMany({}),
        Notification.deleteMany({}),
        DailyBriefing.deleteMany({}),
        TeamMessage.deleteMany({}),
        JudgeReview.deleteMany({}),
        Award.deleteMany({}),
        ClientContact.deleteMany({}),
      ]);

      return await seedAllInternal();
    } finally {
      global._gwdSeeded = true;
      global._gwdSeedingLock = undefined;
    }
  })();

  return await global._gwdSeedingLock;
}

async function seedAllInternal(): Promise<{ message: string }> {
  const hashedPw = await bcrypt.hash("BizSim2026", 10);

  // ─── 1. EVENT ───────────────────────────────────────────────────────────────
  const event = await Event.create({
    name: "GWD BizSim 2026 — Edition 1",
    slug: "bizsim-2026",
    status: "active",
    startDate: new Date("2026-07-21"),
    endDate: new Date("2026-07-29"),
    currentDay: 4,
    totalDays: 9,
    maxParticipants: 200,
    registrationFee: 999,
    totalParticipants: 32,
    totalTeams: 8,
    totalDealsSubmitted: 25,
    totalDealsVerified: 8,
    totalRevenue: 185000,
    demoMode: false,
    broadcastMessages: [
      { time: new Date().toISOString(), title: "Day 4 Begins", message: "Close or Lose — today is your deadline to convert interest signals into real deals!", sentBy: "CEO Pasha" },
    ],
  });

  // ─── 2. NICHES ──────────────────────────────────────────────────────────────
  const niches = await Niche.insertMany([
    { name: "Healthcare", slug: "healthcare", icon: "🏥", color: "#10B981", description: "Dental clinics, GP practices, diagnostic labs, pharmacies", eventId: event._id, totalLeads: 12 },
    { name: "F&B", slug: "fnb", icon: "🍽️", color: "#F59E0B", description: "Cloud kitchens, cafes, restaurants, catering services", eventId: event._id, totalLeads: 10 },
    { name: "Real Estate", slug: "real-estate", icon: "🏗️", color: "#6366F1", description: "Agents, interior designers, property developers", eventId: event._id, totalLeads: 10 },
    { name: "EdTech", slug: "edtech", icon: "📚", color: "#EC4899", description: "Coaching institutes, tutors, skill schools, online courses", eventId: event._id, totalLeads: 10 },
  ]);

  const [nHealthcare, nFnb, nRealEstate, nEdtech] = niches;

  // ─── 3. USERS ───────────────────────────────────────────────────────────────
  // Admin + Organizer + Judge
  const adminUser = await User.create({
    email: "admin@gwd.global", password: hashedPw, name: "Lead Verification Officer",
    role: "admin", participantRole: "wildcard", eventId: event._id,
    orbitScore: 0, tier: "member", skills: ["verification", "client-management"], onboardingComplete: true, onboardingStep: 5,
  });

  const organizerUser = await User.create({
    email: "organizer@gwd.global", password: hashedPw, name: "Mohd Abdul Rahman Pasha (CEO)",
    role: "organizer", participantRole: "wildcard", eventId: event._id,
    orbitScore: 0, tier: "partner", skills: ["leadership", "strategy", "sales"], onboardingComplete: true, onboardingStep: 5,
  });

  const judgeUser = await User.create({
    email: "judge@gwd.global", password: hashedPw, name: "CII CIES Evaluation Chair",
    role: "judge", participantRole: "wildcard", eventId: event._id,
    orbitScore: 0, tier: "member", skills: ["evaluation", "assessment"], onboardingComplete: true, onboardingStep: 5,
  });

  // Participants — 4 per team, 8 teams = 32 participants
  const participantData = [
    // Healthcare Team 1: Phoenix Rising
    { name: "Arjun Reddy", email: "arjun@gwd.global", role: "deal_architect", nicheId: nHealthcare._id },
    { name: "Priya Sharma", email: "priya.sharma@bizsim.in", role: "project_manager", nicheId: nHealthcare._id },
    { name: "Rohan Gupta", email: "rohan.gupta@bizsim.in", role: "developer", nicheId: nHealthcare._id },
    { name: "Sneha Iyer", email: "sneha.iyer@bizsim.in", role: "designer", nicheId: nHealthcare._id },
    // Healthcare Team 2: MediForce
    { name: "Vikram Singh", email: "vikram.singh@bizsim.in", role: "deal_architect", nicheId: nHealthcare._id },
    { name: "Kavya Nair", email: "kavya.nair@bizsim.in", role: "project_manager", nicheId: nHealthcare._id },
    { name: "Ankit Patel", email: "ankit.patel@bizsim.in", role: "developer", nicheId: nHealthcare._id },
    { name: "Meera Rao", email: "meera.rao@bizsim.in", role: "designer", nicheId: nHealthcare._id },
    // F&B Team 1: Spice Street
    { name: "Ravi Kumar", email: "ravi.kumar@bizsim.in", role: "deal_architect", nicheId: nFnb._id },
    { name: "Anjali Verma", email: "anjali.verma@bizsim.in", role: "project_manager", nicheId: nFnb._id },
    { name: "Karthik Menon", email: "karthik.menon@bizsim.in", role: "developer", nicheId: nFnb._id },
    { name: "Divya Prasad", email: "divya.prasad@bizsim.in", role: "designer", nicheId: nFnb._id },
    // F&B Team 2: Plate Pioneers
    { name: "Suresh Babu", email: "suresh.babu@bizsim.in", role: "deal_architect", nicheId: nFnb._id },
    { name: "Lakshmi Devi", email: "lakshmi.devi@bizsim.in", role: "project_manager", nicheId: nFnb._id },
    { name: "Nikhil Jain", email: "nikhil.jain@bizsim.in", role: "developer", nicheId: nFnb._id },
    { name: "Pooja Hegde", email: "pooja.hegde@bizsim.in", role: "designer", nicheId: nFnb._id },
    // Real Estate Team 1: Property Hawks
    { name: "Rahul Deshmukh", email: "rahul.deshmukh@bizsim.in", role: "deal_architect", nicheId: nRealEstate._id },
    { name: "Sana Khan", email: "sana.khan@bizsim.in", role: "project_manager", nicheId: nRealEstate._id },
    { name: "Aditya Mishra", email: "aditya.mishra@bizsim.in", role: "developer", nicheId: nRealEstate._id },
    { name: "Tanya Sharma", email: "tanya.sharma@bizsim.in", role: "designer", nicheId: nRealEstate._id },
    // Real Estate Team 2: BuildForce
    { name: "Manoj Tiwari", email: "manoj.tiwari@bizsim.in", role: "deal_architect", nicheId: nRealEstate._id },
    { name: "Ritika Gupta", email: "ritika.gupta@bizsim.in", role: "project_manager", nicheId: nRealEstate._id },
    { name: "Siddharth Rao", email: "siddharth.rao@bizsim.in", role: "developer", nicheId: nRealEstate._id },
    { name: "Nandini Pillai", email: "nandini.pillai@bizsim.in", role: "designer", nicheId: nRealEstate._id },
    // EdTech Team 1: LearnLab
    { name: "Amit Choudhary", email: "amit.choudhary@bizsim.in", role: "deal_architect", nicheId: nEdtech._id },
    { name: "Neha Saxena", email: "neha.saxena@bizsim.in", role: "project_manager", nicheId: nEdtech._id },
    { name: "Varun Kapoor", email: "varun.kapoor@bizsim.in", role: "developer", nicheId: nEdtech._id },
    { name: "Ishita Bansal", email: "ishita.bansal@bizsim.in", role: "designer", nicheId: nEdtech._id },
    // EdTech Team 2: SkillForge
    { name: "Deepak Rathi", email: "deepak.rathi@bizsim.in", role: "deal_architect", nicheId: nEdtech._id },
    { name: "Shruti Agarwal", email: "shruti.agarwal@bizsim.in", role: "project_manager", nicheId: nEdtech._id },
    { name: "Gaurav Malhotra", email: "gaurav.malhotra@bizsim.in", role: "developer", nicheId: nEdtech._id },
    { name: "Ananya Reddy", email: "ananya.reddy@bizsim.in", role: "designer", nicheId: nEdtech._id },
  ];

  const participants = await User.insertMany(
    participantData.map((p, i) => ({
      email: p.email,
      password: hashedPw,
      name: p.name,
      role: "participant" as const,
      participantRole: p.role,
      eventId: event._id,
      nicheId: p.nicheId,
      orbitScore: Math.floor(Math.random() * 350) + 20,
      tier: "member" as const,
      skills: ["pitching", "digital-marketing"],
      onboardingComplete: true,
      onboardingStep: 5,
    }))
  );

  // ─── 4. TEAMS ───────────────────────────────────────────────────────────────
  const teamDefs = [
    { name: "Phoenix Rising", emoji: "🔥", nicheId: nHealthcare._id, members: participants.slice(0, 4) },
    { name: "MediForce", emoji: "💊", nicheId: nHealthcare._id, members: participants.slice(4, 8) },
    { name: "Spice Street", emoji: "🌶️", nicheId: nFnb._id, members: participants.slice(8, 12) },
    { name: "Plate Pioneers", emoji: "🍳", nicheId: nFnb._id, members: participants.slice(12, 16) },
    { name: "Property Hawks", emoji: "🦅", nicheId: nRealEstate._id, members: participants.slice(16, 20) },
    { name: "BuildForce", emoji: "🏠", nicheId: nRealEstate._id, members: participants.slice(20, 24) },
    { name: "LearnLab", emoji: "🧪", nicheId: nEdtech._id, members: participants.slice(24, 28) },
    { name: "SkillForge", emoji: "⚡", nicheId: nEdtech._id, members: participants.slice(28, 32) },
  ];

  const teams = await Team.insertMany(
    teamDefs.map((t) => ({
      name: t.name,
      emoji: t.emoji,
      eventId: event._id,
      nicheId: t.nicheId,
      memberIds: t.members.map((m: any) => m._id),
      captainId: t.members[0]._id, // DA is captain
      totalScore: t.members.reduce((sum: number, m: any) => sum + m.orbitScore, 0),
      totalRevenue: 0,
      totalDeals: 0,
    }))
  );

  // Assign teamId back to users
  for (let i = 0; i < teams.length; i++) {
    const memberIds = teamDefs[i].members.map((m: any) => m._id);
    await User.updateMany({ _id: { $in: memberIds } }, { teamId: teams[i]._id });
  }

  // ─── 5. LEADS ───────────────────────────────────────────────────────────────
  const leadTemplates = [
    // Healthcare
    { businessName: "Smile Dental Clinic", contactName: "Dr. Rajesh Kumar", nicheId: nHealthcare._id, city: "Hyderabad", suggestedService: "Website + GMB Setup", estimatedValue: 15000 },
    { businessName: "CareFirst Diagnostics", contactName: "Sunil Reddy", nicheId: nHealthcare._id, city: "Hyderabad", suggestedService: "Social Media Management", estimatedValue: 12000 },
    { businessName: "Aarogya Pharmacy", contactName: "Lakshmi Bai", nicheId: nHealthcare._id, city: "Secunderabad", suggestedService: "WhatsApp Business Setup", estimatedValue: 5000 },
    { businessName: "Wellness Physiotherapy", contactName: "Dr. Meena Shah", nicheId: nHealthcare._id, city: "Hyderabad", suggestedService: "Landing Page", estimatedValue: 8000 },
    { businessName: "LifeLine Hospital", contactName: "Dr. Venkat Rao", nicheId: nHealthcare._id, city: "Kukatpally", suggestedService: "Website Redesign", estimatedValue: 25000 },
    { businessName: "MedPlus Clinic", contactName: "Srinivas G", nicheId: nHealthcare._id, city: "Gachibowli", suggestedService: "SEO Package", estimatedValue: 10000 },
    // F&B
    { businessName: "Biryani Box Cloud Kitchen", contactName: "Irfan Ali", nicheId: nFnb._id, city: "Hyderabad", suggestedService: "Menu Landing Page", estimatedValue: 8000 },
    { businessName: "Chai Point Cafe", contactName: "Ramesh Naidu", nicheId: nFnb._id, city: "Banjara Hills", suggestedService: "Instagram Management", estimatedValue: 10000 },
    { businessName: "Fresh Bowls", contactName: "Deepika Joshi", nicheId: nFnb._id, city: "Jubilee Hills", suggestedService: "Online Ordering Page", estimatedValue: 15000 },
    { businessName: "Spice Route Restaurant", contactName: "Mohammed Hussain", nicheId: nFnb._id, city: "Tolichowki", suggestedService: "Website + Social", estimatedValue: 20000 },
    { businessName: "Green Leaf Catering", contactName: "Padma Rani", nicheId: nFnb._id, city: "Ameerpet", suggestedService: "Branding Package", estimatedValue: 12000 },
    // Real Estate
    { businessName: "HomeVision Realty", contactName: "Prakash Jain", nicheId: nRealEstate._id, city: "Hyderabad", suggestedService: "Lead Generation Website", estimatedValue: 30000 },
    { businessName: "Elite Interiors", contactName: "Anisha Kapoor", nicheId: nRealEstate._id, city: "Jubilee Hills", suggestedService: "Portfolio Website", estimatedValue: 20000 },
    { businessName: "BuildRight Properties", contactName: "Satish Reddy", nicheId: nRealEstate._id, city: "Gachibowli", suggestedService: "Property Listing Site", estimatedValue: 35000 },
    { businessName: "NestFinder Realty", contactName: "Geeta Sharma", nicheId: nRealEstate._id, city: "Kondapur", suggestedService: "Google Ads Setup", estimatedValue: 15000 },
    { businessName: "Decor Dreams", contactName: "Kavitha Reddy", nicheId: nRealEstate._id, city: "Madhapur", suggestedService: "Instagram + Branding", estimatedValue: 18000 },
    // EdTech
    { businessName: "Brilliant Tutorials", contactName: "Prof. Venkat", nicheId: nEdtech._id, city: "Hyderabad", suggestedService: "Landing Page + Ads", estimatedValue: 12000 },
    { businessName: "CodeMaster Academy", contactName: "Raj Malhotra", nicheId: nEdtech._id, city: "Hi-Tech City", suggestedService: "Website + Email List", estimatedValue: 18000 },
    { businessName: "SkillUp Institute", contactName: "Preethi Nair", nicheId: nEdtech._id, city: "Kukatpally", suggestedService: "YouTube Channel Setup", estimatedValue: 8000 },
    { businessName: "Math Genius Coaching", contactName: "Sunita Devi", nicheId: nEdtech._id, city: "Ameerpet", suggestedService: "Landing Page", estimatedValue: 6000 },
    { businessName: "TechBridge Learning", contactName: "Arun Kumar", nicheId: nEdtech._id, city: "HITEC City", suggestedService: "Full Website + CRM", estimatedValue: 40000 },
  ];

  const leads = await Lead.insertMany(
    leadTemplates.map((l) => ({
      eventId: event._id,
      nicheId: l.nicheId,
      businessName: l.businessName,
      contactName: l.contactName,
      phone: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
      email: l.businessName.toLowerCase().replace(/\s+/g, "") + "@gmail.com",
      address: `${Math.floor(Math.random() * 500) + 1}, Main Road`,
      city: l.city,
      suggestedService: l.suggestedService,
      estimatedValue: l.estimatedValue,
      status: "available",
      gapAnalysis: `No professional digital presence. ${l.suggestedService} would significantly boost local visibility.`,
      suggestedPitch: `Offer a ${l.suggestedService} package to increase foot traffic and online bookings by 40%.`,
    }))
  );

  // ─── 6. DEALS ───────────────────────────────────────────────────────────────
  // Create deals in various lifecycle stages for realistic demo
  const dealSeed: { leadIdx: number; teamIdx: number; status: string; value: number; pointsAwarded: number }[] = [
    // Phoenix Rising — 4 deals
    { leadIdx: 0, teamIdx: 0, status: "gwd_closed_paid", value: 15000, pointsAwarded: 57 },
    { leadIdx: 1, teamIdx: 0, status: "proposal_sent", value: 12000, pointsAwarded: 10 },
    { leadIdx: 2, teamIdx: 0, status: "admin_pending_contact", value: 5000, pointsAwarded: 10 },
    { leadIdx: 5, teamIdx: 0, status: "delivery_in_progress", value: 10000, pointsAwarded: 60 },
    // MediForce — 3 deals
    { leadIdx: 3, teamIdx: 1, status: "gwd_contacted", value: 8000, pointsAwarded: 10 },
    { leadIdx: 4, teamIdx: 1, status: "negotiating", value: 25000, pointsAwarded: 10 },
    { leadIdx: 5, teamIdx: 1, status: "admin_pending_contact", value: 10000, pointsAwarded: 10 },
    // Spice Street — 4 deals  
    { leadIdx: 6, teamIdx: 2, status: "gwd_closed_paid", value: 8000, pointsAwarded: 54 },
    { leadIdx: 7, teamIdx: 2, status: "gwd_closed_paid", value: 10000, pointsAwarded: 55 },
    { leadIdx: 8, teamIdx: 2, status: "proposal_sent", value: 15000, pointsAwarded: 10 },
    { leadIdx: 10, teamIdx: 2, status: "client_approved", value: 12000, pointsAwarded: 110 },
    // Plate Pioneers — 2 deals
    { leadIdx: 9, teamIdx: 3, status: "admin_pending_contact", value: 20000, pointsAwarded: 10 },
    { leadIdx: 10, teamIdx: 3, status: "lead_cold", value: 12000, pointsAwarded: 5 },
    // Property Hawks — 4 deals
    { leadIdx: 11, teamIdx: 4, status: "gwd_closed_paid", value: 30000, pointsAwarded: 65 },
    { leadIdx: 12, teamIdx: 4, status: "delivery_qa_pass", value: 20000, pointsAwarded: 80 },
    { leadIdx: 14, teamIdx: 4, status: "gwd_contacted", value: 18000, pointsAwarded: 10 },
    { leadIdx: 13, teamIdx: 4, status: "proposal_sent", value: 35000, pointsAwarded: 10 },
    // BuildForce — 2 deals
    { leadIdx: 14, teamIdx: 5, status: "admin_pending_contact", value: 18000, pointsAwarded: 10 },
    { leadIdx: 15, teamIdx: 5, status: "rejected", value: 15000, pointsAwarded: -5 },
    // LearnLab — 3 deals
    { leadIdx: 16, teamIdx: 6, status: "gwd_closed_paid", value: 12000, pointsAwarded: 56 },
    { leadIdx: 17, teamIdx: 6, status: "negotiating", value: 18000, pointsAwarded: 10 },
    { leadIdx: 18, teamIdx: 6, status: "admin_pending_contact", value: 8000, pointsAwarded: 10 },
    // SkillForge — 3 deals
    { leadIdx: 19, teamIdx: 7, status: "gwd_closed_paid", value: 40000, pointsAwarded: 70 },
    { leadIdx: 20, teamIdx: 7, status: "gwd_contacted", value: 6000, pointsAwarded: 10 },
    { leadIdx: 16, teamIdx: 7, status: "proposal_sent", value: 12000, pointsAwarded: 10 },
  ];

  const deals = [];
  for (const d of dealSeed) {
    const lead = leads[d.leadIdx % leads.length];
    const team = teams[d.teamIdx];
    const da = participants[d.teamIdx * 4]; // First member (DA) of each team
    const pm = participants[d.teamIdx * 4 + 1]; // Second member (PM)

    const deal = await Deal.create({
      eventId: event._id,
      teamId: team._id,
      leadId: lead._id,
      dealArchitectId: da._id,
      projectManagerId: pm._id,
      clientName: lead.contactName,
      clientBusiness: lead.businessName,
      clientPhone: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
      clientEmail: lead.email,
      serviceType: lead.suggestedService || "Website",
      dealValue: d.value,
      participantEstimatedValue: d.value,
      gwdFinalDealValue: d.status === "gwd_closed_paid" ? d.value : undefined,
      status: d.status,
      pointsAwarded: d.pointsAwarded,
      bonusPoints: 0,
      deliveryStatus: ["delivery_in_progress", "delivery_qa_pass", "client_delivered", "client_approved"].includes(d.status) ? "in_progress" : "not_started",
      evidence: { notes: `Interest signal from ${lead.businessName}. Pitched ${lead.suggestedService}.` },
      ...(d.status === "gwd_closed_paid" ? { gwdPaymentConfirmedAt: new Date(), gwdPaymentMethod: "Razorpay", gwdPaymentTransactionId: `TXN${Date.now()}${Math.random().toString(36).slice(2, 6)}` } : {}),
      ...(d.status === "client_approved" ? { deliveryStatus: "client_approved" } : {}),
    });

    deals.push(deal);

    // Create ClientContact vault record for each deal
    await ClientContact.create({
      dealId: deal._id,
      businessName: lead.businessName,
      contactPerson: lead.contactName,
      phone: deal.clientPhone,
      email: deal.clientEmail,
      interactions: [{
        date: new Date(),
        type: "meeting",
        handledBy: da._id,
        summary: `Initial interest signal for ${lead.suggestedService}`,
        outcome: "Queued for GWD contact",
      }],
    });
  }

  // Update team revenue/deal counts for closed deals
  for (let i = 0; i < teams.length; i++) {
    const teamDeals = deals.filter((d) => d.teamId.toString() === teams[i]._id.toString());
    const closedDeals = teamDeals.filter((d) => ["gwd_closed_paid", "client_approved"].includes(d.status));
    const revenue = closedDeals.reduce((sum, d) => sum + (d.gwdFinalDealValue || d.dealValue), 0);
    await Team.findByIdAndUpdate(teams[i]._id, {
      totalRevenue: revenue,
      totalDeals: closedDeals.length,
    });
  }

  // ─── 7. SCORES (ledger entries for closed deals) ────────────────────────────
  for (const deal of deals) {
    if (deal.pointsAwarded > 0) {
      await Score.create({
        userId: deal.dealArchitectId,
        teamId: deal.teamId,
        eventId: event._id,
        dealId: deal._id,
        action: deal.status === "gwd_closed_paid" ? "deal_closed_payment" : "deal_submitted",
        points: deal.pointsAwarded,
        description: `${deal.clientBusiness} — ${deal.serviceType}`,
      });
    }
  }

  // ─── 8. JUDGE REVIEWS (for closed deals with deliverables) ──────────────────
  const closedDeals = deals.filter((d) => ["gwd_closed_paid", "client_approved", "delivery_qa_pass"].includes(d.status));
  for (const deal of closedDeals.slice(0, 4)) { // Judge reviews 4 deals
    await JudgeReview.create({
      judgeId: judgeUser._id,
      dealId: deal._id,
      teamId: deal.teamId,
      eventId: event._id,
      designScore: Math.floor(Math.random() * 3) + 7,
      technicalScore: Math.floor(Math.random() * 3) + 6,
      pitchScore: Math.floor(Math.random() * 3) + 7,
      innovationScore: Math.floor(Math.random() * 4) + 6,
      scalabilityScore: Math.floor(Math.random() * 3) + 5,
    });
  }

  // ─── 9. NOTIFICATIONS ──────────────────────────────────────────────────────
  const notifTemplates = [
    { userId: participants[0]._id, type: "deal_approved", title: "Deal Closed & Paid!", message: "Your deal for Smile Dental Clinic (Rs.15,000) has been closed!", link: `/deals/${deals[0]._id}` },
    { userId: participants[0]._id, type: "system", title: "Day 4: Close or Lose!", message: "Today is the deadline to convert interest signals into real deals.", read: true },
    { userId: participants[8]._id, type: "deal_approved", title: "Two Deals Closed!", message: "Biryani Box and Chai Point deals are confirmed. You're on fire!", link: `/deals/${deals[7]._id}` },
    { userId: participants[16]._id, type: "deal_approved", title: "Deal Closed!", message: "HomeVision Realty deal closed at Rs.30,000. Property Hawks lead the pack!" },
    { userId: participants[0]._id, type: "system", title: "Welcome to BizSim 2026", message: "Your simulation journey begins now. Check your niche briefing to get started.", read: true },
  ];

  await Notification.insertMany(
    notifTemplates.map((n) => ({
      ...n,
      eventId: event._id,
      read: n.read || false,
    }))
  );

  // ─── 10. DAILY BRIEFINGS ───────────────────────────────────────────────────
  const briefings = [
    { day: 1, title: "Orientation & Niche Reveal", content: "Welcome to BizSim 2026! Today your niche and team have been revealed. Study your leads, understand your market, and prepare your pitch strategy.", challenges: ["Claim at least 2 leads from your niche pipeline", "Draft your opening pitch script"], tips: ["Research each business on Google Maps before calling", "Prepare a 30-second elevator pitch"] },
    { day: 2, title: "Lead Research & First Pitches", content: "Time to make contact! Call your claimed leads, introduce GWD services, and gauge interest.", challenges: ["Make at least 3 discovery calls", "Submit 1 interest signal"], tips: ["Ask open-ended questions: 'What's your biggest challenge with getting new customers?'", "Take notes during every call"] },
    { day: 3, title: "Discovery Calls & Wireframes", content: "Deep dive into your prospects' needs. Create wireframes or mockups to share with interested leads.", challenges: ["Schedule a video demo with at least 1 lead", "Share a preview link or wireframe"], tips: ["Use Canva or Figma for quick mockups", "Send a follow-up WhatsApp within 2 hours of every call"] },
    { day: 4, title: "Close or Lose (Deadline Day)", content: "This is it — D-Day. Convert your interest signals into confirmed deals. GWD Sales will close and collect payment. Every deal closed today earns a speed bonus!", challenges: ["Get at least 1 verbal agreement", "Submit all pending interest signals"], tips: ["Create urgency: 'We have limited slots for this week'", "Follow up with every prospect from Days 2-3"] },
  ];

  await DailyBriefing.insertMany(
    briefings.map((b) => ({
      eventId: event._id,
      dayNumber: b.day,
      title: b.title,
      subtitle: b.content,
      objectives: b.challenges.map((c, i) => ({ text: c, points: (i + 1) * 10 })),
      tips: b.tips,
      wildCard: { active: false, title: "", description: "", bonusPoints: 0 },
      statsSnapshot: { totalDeals: 0, totalRevenue: 0 },
    }))
  );

  // ─── 11. TEAM MESSAGES ─────────────────────────────────────────────────────
  await TeamMessage.insertMany([
    { teamId: teams[0]._id, userId: participants[0]._id, content: "Just got off the call with Smile Dental — they're interested! Submitting the signal now.", type: "text" },
    { teamId: teams[0]._id, userId: participants[1]._id, content: "Great work Arjun! I'll prep the project brief once GWD confirms.", type: "text" },
    { teamId: teams[0]._id, userId: participants[2]._id, content: "I've started the wireframe for the dental clinic website. Will share by tonight.", type: "text" },
    { teamId: teams[2]._id, userId: participants[8]._id, content: "Two deals closed today! Biryani Box and Chai Point. We're leading F&B! 🌶️", type: "text" },
    { teamId: teams[4]._id, userId: participants[16]._id, content: "HomeVision Realty deal closed at 30k! Biggest deal so far. Property Hawks on top! 🦅", type: "text" },
  ]);

  return { message: "Seeded successfully: 1 event, 4 niches, 8 teams, 35 users, 21 leads, 25 deals, scores, reviews, notifications, briefings, messages" };
}
