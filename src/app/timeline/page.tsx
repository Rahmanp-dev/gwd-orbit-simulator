"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { useEventDay } from "@/hooks/useEventDay";
import { CheckCircle2, Lock, ArrowRight, Loader2 } from "lucide-react";

const TIMELINE_DAYS = [
  {
    day: 1,
    title: "Niche Assignment & Lead Reveal",
    tagline: "Teams receive their specialized industry niche and pre-qualified lead lists.",
    pointsAvailable: 100,
    keyObjective: "Contact at least 10 leads and set up 3 discovery calls.",
    deliverable: "Lead CRM Initialized",
    date: "July 7, 2026",
    link: "/niche",
  },
  {
    day: 2,
    title: "Discovery Calls & Rapid Wireframing",
    tagline: "Uncover client pain points and present custom interactive mockups.",
    pointsAvailable: 150,
    keyObjective: "Present at least 2 live mockup previews to prospective business owners.",
    deliverable: "2 Interactive Wireframe Links",
    date: "July 8, 2026",
    link: "/briefing",
  },
  {
    day: 3,
    title: "Proposals & First Razorpay Closes",
    tagline: "Send formal GWD agreements and collect advance payments online.",
    pointsAvailable: 200,
    keyObjective: "Secure at least ₹15,000 in verified advance payment confirmations.",
    deliverable: "Payment Proof Screenshot & Signed Agreement",
    date: "July 9, 2026",
    link: "/briefing",
  },
  {
    day: 4,
    title: "Close or Lose! (Live Day)",
    tagline: "Mandatory closing deadline. Teams without verified revenue face leaderboard penalties.",
    pointsAvailable: 300,
    keyObjective: "Close at least 1 deal and log all conversation evidence in the portal.",
    deliverable: "Verified Deal Submission",
    date: "July 10, 2026",
    link: "/briefing",
  },
  {
    day: 5,
    title: "Build & Delivery Marathon",
    tagline: "Developers and designers build production-ready Next.js web applications.",
    pointsAvailable: 250,
    keyObjective: "Deploy high-speed web apps and integrate Google My Business / SEO tags.",
    deliverable: "Vercel Production Deployment URL",
    date: "July 11, 2026",
    link: "/briefing",
  },
  {
    day: 6,
    title: "Quality Audits & Client Revisions",
    tagline: "Internal QA checks and client feedback iteration loops.",
    pointsAvailable: 200,
    keyObjective: "Achieve 100% responsive mobile scores and client approval sign-off.",
    deliverable: "Lighthouse 95+ Performance Screenshot",
    date: "July 12, 2026",
    link: "/briefing",
  },
  {
    day: 7,
    title: "The Wild Card Challenge (+400 pts)",
    tagline: "Surprise enterprise sprint released by GWD CEO for all teams simultaneously.",
    pointsAvailable: 400,
    keyObjective: "Solve the 6-hour surprise business simulation case study.",
    deliverable: "Wild Card Pitch Deck & Video Walkthrough",
    date: "July 13, 2026",
    link: "/briefing",
  },
  {
    day: 8,
    title: "Final Push & Sign-offs",
    tagline: "Collect final balance payments and 5-star client testimonials.",
    pointsAvailable: 300,
    keyObjective: "Close out all open deliverables and submit complete revenue logs.",
    deliverable: "Client 5-Star Testimonial & Balance Receipt",
    date: "July 14, 2026",
    link: "/briefing",
  },
  {
    day: 9,
    title: "Grand Finale & Orbit Offers",
    tagline: "Live pitch presentations, ₹1.2L prize distribution, and Founding Partner contracts.",
    pointsAvailable: 500,
    keyObjective: "Deliver the 3-minute founding team presentation on main stage.",
    deliverable: "Final Team Pitch Deck (.pptx)",
    date: "July 15, 2026",
    link: "/finale",
  },
];

export default function TimelinePage() {
  const { currentDay, totalDays, loading } = useEventDay();

  /** Derive day status dynamically from the live currentDay */
  const getDayStatus = (day: number): "completed" | "active" | "locked" => {
    if (day < currentDay) return "completed";
    if (day === currentDay) return "active";
    return "locked";
  };

  const totalPoints = TIMELINE_DAYS.reduce((acc, d) => acc + d.pointsAvailable, 0);

  return (
    <DashboardLayout title="9-Day Simulation Timeline" breadcrumbs={["Home", "Timeline"]}>
      {/* Hero Banner */}
      <div className="bg-[var(--dark)] text-white rounded-3xl p-8 mb-8 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-[var(--crimson)]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mb-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-[var(--crimson)] rounded-full text-xs font-bold uppercase tracking-wider">
                BizSim 2026 Game Board
              </span>
              {loading ? (
                <span className="flex items-center gap-1.5 text-xs text-gray-300">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
                </span>
              ) : (
                <Badge variant="warning" size="sm">
                  Current: Day {currentDay} of {totalDays}
                </Badge>
              )}
            </div>
            <h1
              className="text-3xl md:text-4xl font-extrabold"
            >
              The 9-Day Orbit Odyssey
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
              Every day brings new high-stakes business challenges, client negotiations, and point
              multipliers. Complete daily deliverables to climb the leaderboard and unlock founding
              roles at GWD Orbit.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[200px] justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Total Prize Pool
              </div>
              <div className="text-2xl font-black text-green-400 mt-0.5">₹1,20,000</div>
            </div>
            <div className="border-l border-white/10 pl-4">
              <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Max Points
              </div>
              <div className="text-2xl font-extrabold text-[var(--crimson)] mt-0.5">
                {totalPoints.toLocaleString()}+
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Track Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TIMELINE_DAYS.map((item) => {
          const status = getDayStatus(item.day);

          return (
            <div
              key={item.day}
              className={`card p-6 border transition-all relative overflow-hidden flex flex-col justify-between ${
                status === "active"
                  ? "border-2 border-[var(--crimson)] bg-white shadow-lg ring-4 ring-[var(--crimson)]/10"
                  : status === "completed"
                  ? "border-[var(--border)] bg-[var(--surface-alt)]/60 opacity-90 hover:opacity-100"
                  : "border-[var(--border)] bg-gray-50/40 opacity-70 hover:opacity-90"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                        status === "active"
                          ? "bg-[var(--crimson)] text-white"
                          : status === "completed"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      D{item.day}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-muted)]">{item.date}</span>
                  </div>

                  {status === "completed" && (
                    <Badge variant="success" size="sm">
                      Completed ✓
                    </Badge>
                  )}
                  {status === "active" && (
                    <Badge variant="danger" size="sm">
                      LIVE TODAY 🔥
                    </Badge>
                  )}
                  {status === "locked" && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)] bg-gray-200/80 px-2.5 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h3
                  className="text-lg font-bold text-[var(--text-primary)] leading-tight"
                >
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed min-h-[36px]">
                  {item.tagline}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border)]/80 space-y-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    Key Objective
                  </div>
                  <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">
                    {item.keyObjective}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-black text-[var(--crimson)] bg-[var(--crimson-pale)] px-2.5 py-1 rounded-lg">
                    +{item.pointsAvailable} max pts
                  </span>

                  {status === "active" ? (
                    <Link
                      href={item.link}
                      className="px-3.5 py-1.5 bg-[var(--crimson)] text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[var(--crimson-dark)] transition-colors shadow-2xs"
                    >
                      <span>Open Mission</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : status === "completed" ? (
                    <Link
                      href={item.link}
                      className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                    >
                      <span>Review</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    </Link>
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">
                      Unlocks on Day {item.day}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
