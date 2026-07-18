"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import { useEventDay, DAY_LABELS } from "@/hooks/useEventDay";
import { Calendar, Target, Lightbulb, Clock, AlertTriangle, Loader2, FileText } from "lucide-react";

/** Per-day objectives, tips, and mentor sessions */
const DAY_CONTENT: Record<
  number,
  {
    tagline: string;
    objectives: Array<{ text: string; points: number; priority: "high" | "medium" | "low" }>;
    tips: string[];
    mentorSessions: Array<{ time: string; mentor: string; topic: string }>;
  }
> = {
  1: {
    tagline: "Your niche is revealed. Research your vertical, claim leads, and scout competitors.",
    objectives: [
      { text: "Review your assigned niche and lead list in full", points: 5, priority: "high" },
      { text: "Complete team introductions in the War Room", points: 5, priority: "high" },
      { text: "Claim at least 2 leads for your team", points: 20, priority: "medium" },
      { text: "Research competitor websites in your niche", points: 10, priority: "low" },
    ],
    tips: [
      "Study the niche lead gap analysis — that's your pitch blueprint.",
      "Claim leads early before competitor teams lock them out.",
      "Set up a team WhatsApp group for rapid coordination.",
      "Check the timeline for today's point opportunities.",
    ],
    mentorSessions: [
      { time: "10:00 AM", mentor: "Pasha (CEO, GWD)", topic: "Orientation & simulation rules" },
      { time: "2:00 PM", mentor: "Vivek R. (Markitome)", topic: "Niche research methodology" },
    ],
  },
  2: {
    tagline: "Hit the phones. First contact with 5+ leads today — every conversation is scored.",
    objectives: [
      { text: "Contact at least 5 leads (call / WhatsApp)", points: 15, priority: "high" },
      { text: "Complete 2 discovery calls (5+ min each)", points: 16, priority: "high" },
      { text: "Log all conversations in the CRM pipeline", points: 5, priority: "medium" },
      { text: "Send at least 1 initial proposal or preview link", points: 10, priority: "medium" },
    ],
    tips: [
      "Lead with a problem question — 'How do you currently handle online bookings?'",
      "Record call duration; 5+ minutes = Discovery Call bonus points.",
      "Share your demo site link early to hook interest before the pitch.",
      "Don't pitch price on the first call. Build rapport first.",
    ],
    mentorSessions: [
      { time: "11:00 AM", mentor: "Pasha (CEO, GWD)", topic: "Cold calling frameworks for local businesses" },
      { time: "4:00 PM", mentor: "Guest Mentor", topic: "Building rapport over WhatsApp" },
    ],
  },
  3: {
    tagline: "Wireframes today. Show something tangible — a demo beats a description every time.",
    objectives: [
      { text: "Share a preview / wireframe link with 2+ interested leads", points: 20, priority: "high" },
      { text: "Book 3 follow-up calls for tomorrow", points: 12, priority: "high" },
      { text: "Submit at least 1 deal to the GWD pipeline", points: 10, priority: "medium" },
      { text: "Update all lead statuses in CRM", points: 0, priority: "low" },
    ],
    tips: [
      "Use Vercel to deploy a real-looking demo site in under 30 mins.",
      "Leads that see a preview convert 3x better than those who just hear a pitch.",
      "Anticipate the top 3 objections: price, trust, and timing. Have answers ready.",
      "Follow up within 2 hours of sending a demo — momentum matters.",
    ],
    mentorSessions: [
      { time: "12:00 PM", mentor: "Pasha (CEO, GWD)", topic: "Converting interest to commitment" },
      { time: "3:30 PM", mentor: "Dev Mentor", topic: "Rapid demo deployment on Vercel" },
    ],
  },
  4: {
    tagline: "Close or Lose — first deals must be finalized today. Score updates live.",
    objectives: [
      { text: "Close at least 1 deal with confirmed payment", points: 50, priority: "high" },
      { text: "Send at least 3 proposals to interested leads", points: 45, priority: "medium" },
      { text: "Book 2 discovery calls for tomorrow's pipeline", points: 16, priority: "medium" },
      { text: "Update all lead statuses in the CRM", points: 0, priority: "low" },
    ],
    tips: [
      "Don't negotiate on price too early. Show the preview — let value speak.",
      "If a lead says 'send me the price', reply: 'What's your biggest digital pain point?'",
      "Follow up on yesterday's conversations before cold-calling new leads.",
      "Screenshot EVERY conversation for deal verification evidence.",
    ],
    mentorSessions: [
      { time: "11:00 AM", mentor: "Pasha (CEO, GWD)", topic: "Closing techniques for hesitant clients" },
      { time: "3:00 PM", mentor: "Vivek R. (Markitome)", topic: "Enterprise pitch structuring" },
    ],
  },
  5: {
    tagline: "Delivery sprint begins. Build, deploy, and hand off what you promised.",
    objectives: [
      { text: "Deploy the first deliverable to your assigned domain", points: 30, priority: "high" },
      { text: "Submit deliverable URL through the deal tracker", points: 20, priority: "high" },
      { text: "Complete PM handoff meeting with client", points: 15, priority: "medium" },
      { text: "Close 1 additional deal from your pipeline", points: 50, priority: "medium" },
    ],
    tips: [
      "Use the GWD delivery checklist: responsive, fast, has a contact form, Google Analytics.",
      "PM-led handoff calls get bonus points — schedule them now.",
      "Don't wait for perfection; deploy a working MVP first.",
      "If client requests changes, log them in the deal tracker for QA review.",
    ],
    mentorSessions: [
      { time: "10:30 AM", mentor: "Dev Lead", topic: "Production deployment best practices" },
      { time: "2:00 PM", mentor: "Pasha (CEO, GWD)", topic: "Delivery quality standards" },
    ],
  },
  6: {
    tagline: "QA day — admin reviews your deliverables before client handoff.",
    objectives: [
      { text: "Submit all outstanding deliverables for admin QA", points: 25, priority: "high" },
      { text: "Resolve all QA feedback within 3 hours", points: 20, priority: "high" },
      { text: "Collect client testimonial or review screenshot", points: 30, priority: "medium" },
      { text: "Begin work on second deal in pipeline", points: 10, priority: "low" },
    ],
    tips: [
      "QA checks look for: mobile responsiveness, working contact forms, no broken links.",
      "Get a WhatsApp review from the client immediately after delivery — it's bonus points.",
      "5-star client approval = +50 bonus pts. Go above and beyond.",
      "Document what you built: screenshots + a short summary in the deal notes.",
    ],
    mentorSessions: [
      { time: "11:00 AM", mentor: "Admin QA Panel", topic: "QA standards and common rejection reasons" },
      { time: "3:00 PM", mentor: "Pasha (CEO, GWD)", topic: "Client satisfaction strategies" },
    ],
  },
  7: {
    tagline: "Presentation prep day. Craft your team's story for the sponsor showcase.",
    objectives: [
      { text: "Prepare a 5-slide team presentation deck", points: 25, priority: "high" },
      { text: "Record a 60-second team introduction video", points: 20, priority: "high" },
      { text: "Document top 3 deals with case study format", points: 15, priority: "medium" },
      { text: "Final pipeline cleanup — close any pending deals", points: 50, priority: "medium" },
    ],
    tips: [
      "Your presentation should tell a story: Problem → Solution → Revenue → Impact.",
      "Include real client names and revenue numbers — specificity builds credibility.",
      "Practice the 5-min pitch until it feels natural before the showcase.",
      "Sponsors will ask about your team's biggest challenge — have an honest, growth-focused answer.",
    ],
    mentorSessions: [
      { time: "10:00 AM", mentor: "Vivek R. (Markitome)", topic: "Storytelling for B2B presentations" },
      { time: "2:30 PM", mentor: "Pasha (CEO, GWD)", topic: "Presentation polish and delivery" },
    ],
  },
  8: {
    tagline: "Sponsor showcase — pitch your team's results to the CII CIES judges.",
    objectives: [
      { text: "Deliver 5-minute team pitch to judging panel", points: 100, priority: "high" },
      { text: "Answer judge Q&A confidently", points: 50, priority: "high" },
      { text: "Submit final deal count and revenue total to admin", points: 25, priority: "medium" },
      { text: "Nominate a teammate for an individual award", points: 10, priority: "low" },
    ],
    tips: [
      "Start with your biggest win — most impressive number first.",
      "Judges will challenge your numbers — have the deal verification screenshots ready.",
      "Show the actual live websites you deployed — not just mockups.",
      "Be specific about your team's unique process that got results.",
    ],
    mentorSessions: [
      { time: "9:00 AM", mentor: "Judge Panel (CII CIES)", topic: "Evaluation rubric briefing" },
      { time: "4:00 PM", mentor: "Pasha (CEO, GWD)", topic: "Post-showcase debrief" },
    ],
  },
  9: {
    tagline: "Grand Finale — awards, prize distribution, and Founding Partner contract ceremony.",
    objectives: [
      { text: "Attend the Grand Finale ceremony", points: 50, priority: "high" },
      { text: "Accept or decline the Founding Partner contract", points: 0, priority: "high" },
      { text: "Submit your team's final retrospective", points: 20, priority: "medium" },
      { text: "Connect with at least 3 industry mentors on LinkedIn", points: 15, priority: "low" },
    ],
    tips: [
      "Whether you win or not — the connections and experience are the real prize.",
      "The Founding Partner contract is a real GWD Global engagement — read it carefully.",
      "Thank your mentors, judges, and organizers. This opens doors.",
      "Document your journey — LinkedIn posts about your experience get recruiter attention.",
    ],
    mentorSessions: [
      { time: "10:00 AM", mentor: "Pasha (CEO, GWD)", topic: "Grand Finale ceremony and prize distribution" },
      { time: "12:00 PM", mentor: "CII CIES", topic: "Founding Partner contract ceremony" },
    ],
  },
};

import { useUserRole } from "@/hooks/useUserRole";

export default function BriefingPage() {
  const { role, isLoading: roleLoading } = useUserRole();
  const { currentDay, totalDays, loading, error } = useEventDay();

  if (roleLoading) {
    return (
      <DashboardLayout title="Daily Briefing" breadcrumbs={["Home", "Briefing"]}>
        <div className="flex items-center justify-center py-20 text-sm text-[var(--text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin mr-3 text-[var(--crimson)]" />
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  if (role !== 'participant') {
    return (
      <DashboardLayout title="Daily Briefing" breadcrumbs={['Home', 'Briefing']}>
        <div className="flex flex-col items-center justify-center text-center p-12 min-h-[60vh]">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-3">Participants Only</h2>
          <p className="text-[var(--text-secondary)] max-w-md">The Daily Briefing is the participants' mission guide. Your role has a dedicated dashboard instead.</p>
        </div>
      </DashboardLayout>
    );
  }

  const dayData = DAY_CONTENT[currentDay] ?? DAY_CONTENT[4];
  const dayName = DAY_LABELS[currentDay] ?? `Day ${currentDay}`;

  if (loading) {
    return (
      <DashboardLayout title="Daily Briefing" breadcrumbs={["Home", "Briefing"]}>
        <div className="flex items-center justify-center py-20 text-sm text-[var(--text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin mr-3 text-[var(--crimson)]" />
          Loading today's briefing...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Daily Briefing"
      breadcrumbs={["Home", "Briefing", `Day ${currentDay}`]}
    >
      {/* ═══ HEADER ═══ */}
      <div className="bg-[var(--dark)] text-white rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="px-3 py-1 bg-[var(--crimson)] rounded-full text-xs font-bold uppercase tracking-wider">
            Day {currentDay} of {totalDays}
          </div>
          <Badge variant="warning" size="sm">Live Event</Badge>
          {error && (
            <Badge variant="outline" size="sm">Offline Mode</Badge>
          )}
        </div>
        <h1
          className="text-3xl font-bold mb-2"
        >
          {dayName}
        </h1>
        <p className="text-gray-400 text-lg">{dayData.tagline}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ═══ TODAY'S OBJECTIVES ═══ */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-5 h-5 text-[var(--crimson)]" />
              <h2 className="font-bold text-base">Today's Objectives</h2>
            </div>
            <div className="space-y-3">
              {dayData.objectives.map((obj, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--surface-alt)]"
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      obj.priority === "high"
                        ? "border-[var(--crimson)]"
                        : obj.priority === "medium"
                        ? "border-[var(--warning)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{obj.text}</p>
                  </div>
                  {obj.points > 0 && (
                    <span className="text-xs font-bold text-[var(--crimson)] bg-[var(--crimson-pale)] px-2 py-0.5 rounded-full flex-shrink-0">
                      +{obj.points} pts
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ═══ TIPS ═══ */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb className="w-5 h-5 text-[var(--warning)]" />
              <h2 className="font-bold text-base">Pro Tips for Today</h2>
            </div>
            <div className="space-y-3">
              {dayData.tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm text-[var(--text-secondary)] leading-relaxed"
                >
                  <span className="text-[var(--warning)] font-bold flex-shrink-0">💡</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ SIDEBAR ═══ */}
        <div className="space-y-6">
          {/* Mentor Sessions */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-[var(--crimson)]" />
              <h3 className="font-bold text-sm">Mentor Sessions</h3>
            </div>
            <div className="space-y-3">
              {dayData.mentorSessions.map((session, i) => (
                <div key={i} className="p-3 rounded-lg bg-[var(--surface-alt)]">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="text-xs font-semibold text-[var(--crimson)]">
                      {session.time}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{session.mentor}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{session.topic}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Reminder */}
          <div className="card p-5 border-[var(--warning)] bg-[var(--warning-pale)]">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
              <h3 className="font-bold text-sm">Scoring Reminder</h3>
            </div>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <p>• Screenshot every WhatsApp/call conversation</p>
              <p>• Deals without evidence will be rejected (−15 pts)</p>
              <p>• Only use your team&apos;s Razorpay link for payments</p>
              <p>• Cross-team lead contact = disqualification</p>
            </div>
          </div>

          {/* Day navigation */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-3">Simulation Progress</h3>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  title={DAY_LABELS[day]}
                  className={`h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-colors cursor-default ${
                    day < currentDay
                      ? "bg-[var(--success-pale)] text-[var(--success)]"
                      : day === currentDay
                      ? "bg-[var(--crimson)] text-white"
                      : "bg-[var(--surface-alt)] text-[var(--text-muted)]"
                  }`}
                >
                  D{day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
