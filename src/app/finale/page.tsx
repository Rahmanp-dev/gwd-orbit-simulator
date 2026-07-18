"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Flame,
  ArrowRight,
  UserCheck,
  Briefcase,
  DollarSign,
  Star,
} from "lucide-react";

import { useEventDay } from "@/hooks/useEventDay";
import { useLeaderboard } from "@/hooks/useData";

export default function GrandFinalePage() {
  const [contractAccepted, setContractAccepted] = useState(false);
  const { currentDay, loading } = useEventDay();
  const { data: teamData } = useLeaderboard("team");

  const teams = teamData?.leaderboard || [];
  const top1 = teams[0] || { name: "Team Phoenix", totalRevenue: 142000, totalScore: 820, totalDeals: 12, captainId: { name: "Arjun Reddy" }, nicheId: { name: "Healthcare & Dental Clinics" } };
  const top2 = teams[1] || { name: "Team Titan", totalRevenue: 35000, totalScore: 745, totalDeals: 5, captainId: { name: "Priya Sharma" }, nicheId: { name: "F&B & Cloud Kitchens" } };
  const top3 = teams[2] || { name: "Team Rocket", totalRevenue: 25000, totalScore: 680, totalDeals: 4, captainId: { name: "Ravi Kumar" }, nicheId: { name: "Real Estate & Interiors" } };

  const totalVerifiedRevenue = teams.reduce((sum: number, t: any) => sum + (t.totalRevenue || 0), 0) || 485000;

  if (!loading && currentDay < 9) {
    return (
      <DashboardLayout title="Grand Finale Locked" breadcrumbs={["Home", "Grand Finale"]}>
        <div className="flex flex-col items-center justify-center text-center p-12 min-h-[60vh]">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-4">
            The Grand Finale is Locked
          </h1>
          <p className="text-[var(--text-secondary)] max-w-md">
            The Orbit Odyssey concludes on Day 9. Keep pushing forward and closing deals to secure your spot on the podium.
          </p>
          <div className="mt-8">
            <Badge variant="warning" size="md">Currently on Day {currentDay} of 9</Badge>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Grand Finale & Prize Distribution" breadcrumbs={["Home", "Grand Finale"]}>
      {/* Hero Celebration Banner */}
      <div className="bg-gradient-to-r from-[var(--dark)] via-black to-[var(--crimson)]/80 text-white rounded-3xl p-8 md:p-12 mb-10 border border-white/20 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest text-yellow-400 mb-2">
            <Sparkles className="w-4 h-4" /> GWD BizSim 2026 Champion Showcase <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            The Orbit Odyssey Finale
          </h1>
          <p className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Congratulations to all 156 participants across 39 squads! Together, you digitalized real-world businesses, closed verified revenue, and proved the power of the GWD micro-agency ecosystem.
          </p>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
            <div className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="text-xs uppercase font-bold text-gray-400">Total Prize Pool Distributed</div>
              <div className="text-3xl font-black text-yellow-400">₹1,20,000</div>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="text-xs uppercase font-bold text-gray-400">Total Verified Client Revenue</div>
              <div className="text-3xl font-black text-green-400">₹{Number(totalVerifiedRevenue).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Champion Podium Grid */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
            👑 Top 3 Micro-Agency Champions
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Evaluated by Dr. Suman & Vivek R. based on verified revenue and technical Lighthouse excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* #2 Winner */}
          <div className="card p-6 border-2 border-slate-300 bg-gradient-to-b from-slate-50 to-white text-center shadow-lg order-2 md:order-1 relative animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
            <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white text-slate-700 font-black text-xl flex items-center justify-center mx-auto -mt-12 shadow-md">
              #2
            </div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] mt-4">
              {top2.name}
            </h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-0.5 rounded-full inline-block mt-1">
              {top2.nicheId?.name || "F&B & Cloud Kitchens"}
            </span>
            <div className="my-6 space-y-1">
              <div className="text-3xl font-black text-[var(--text-primary)]">₹{Number(top2.totalRevenue || 0).toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)] font-bold uppercase">Cash Prize Winner</div>
            </div>
            <div className="pt-4 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] font-medium">
              Captain: <strong>{top2.captainId?.name || "Priya Sharma"}</strong> ({top2.totalScore || 0} pts)
            </div>
          </div>

          {/* #1 Winner */}
          <div className="card p-8 border-4 border-yellow-400 bg-gradient-to-b from-yellow-50/80 via-white to-white text-center shadow-2xl order-1 md:order-2 relative md:-translate-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
              🏆 Overall Hackathon Champion
            </div>
            <div className="w-20 h-20 rounded-full bg-yellow-400 border-4 border-white text-black font-black text-2xl flex items-center justify-center mx-auto -mt-14 shadow-xl">
              #1
            </div>
            <h3 className="text-3xl font-black text-[var(--text-primary)] mt-5">
              {top1.name}
            </h3>
            <span className="text-xs font-extrabold text-[var(--crimson)] bg-[var(--crimson-pale)] px-3.5 py-1 rounded-full inline-block mt-1.5">
              {top1.nicheId?.name || "Healthcare & Dental Clinics"}
            </span>
            <div className="my-6 space-y-1">
              <div className="text-4xl font-black text-[var(--crimson)]">₹{Number(top1.totalRevenue || 0).toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)] font-extrabold uppercase tracking-wider">Title Sponsor Cash Prize</div>
            </div>
            <div className="pt-4 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] font-medium space-y-1">
              <div>Captain: <strong>{top1.captainId?.name || "Arjun Reddy"}</strong> ({top1.totalScore || 0} pts)</div>
              <div className="text-green-600 font-bold">{top1.totalDeals || 0} Verified Client Closes</div>
            </div>
          </div>

          {/* #3 Winner */}
          <div className="card p-6 border-2 border-amber-600/40 bg-gradient-to-b from-amber-50/50 to-white text-center shadow-lg order-3 relative animate-in fade-in slide-in-from-bottom-5 duration-500 delay-200">
            <div className="w-16 h-16 rounded-full bg-amber-600/20 border-4 border-white text-amber-800 font-black text-xl flex items-center justify-center mx-auto -mt-12 shadow-md">
              #3
            </div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] mt-4">
              {top3.name}
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full inline-block mt-1">
              {top3.nicheId?.name || "Real Estate & Interiors"}
            </span>
            <div className="my-6 space-y-1">
              <div className="text-3xl font-black text-[var(--text-primary)]">₹{Number(top3.totalRevenue || 0).toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)] font-bold uppercase">Cash Prize Winner</div>
            </div>
            <div className="pt-4 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] font-medium">
              Captain: <strong>{top3.captainId?.name || "Ravi Kumar"}</strong> ({top3.totalScore || 0} pts)
            </div>
          </div>
        </div>
      </div>

      {/* Special Category Awards */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          🌟 Special Category Award Winners
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Best Deal Architect Award", winner: "Arjun Reddy (Phoenix)", desc: "Highest conversion rate on client pitches and discovery calls." },
            { title: "Fastest Execution Sprint", winner: "Team Titan Squad", desc: "Delivered Green Leaf Café QR ordering app in record 9 hours." },
            { title: "Top Commercial Scalability", winner: "Team Rocket Squad", desc: "Most replicable Next.js 3D walkthrough template." },
          ].map((item, i) => (
            <div key={i} className="card p-6 border border-[var(--border)] bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[var(--crimson-pale)] text-[var(--crimson)] flex items-center justify-center mb-3">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[var(--text-primary)]">{item.title}</h3>
                <div className="text-sm font-extrabold text-[var(--crimson)] mt-1">{item.winner}</div>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between items-center text-[10px] font-bold uppercase text-[var(--text-muted)]">
                <span>Awarded by CII CIES</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GWD Orbit Founding Partner Contract Reveal */}
      <div className="bg-[var(--dark)] text-white rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-[var(--crimson)]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mb-20" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--crimson)] text-white text-xs font-bold uppercase tracking-wider mb-4">
            <UserCheck className="w-4 h-4" /> Official GWD Orbit Invitation
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold">
            Step Into GWD Orbit as a Founding Partner
          </h2>
          <p className="text-gray-300 text-sm md:text-base mt-3 leading-relaxed">
            Your performance in BizSim has unlocked your permanent status in our ecosystem. You are now invited to run your own micro-agency or join our core product verticals with direct revenue-share contracts.
          </p>

          <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs md:text-sm text-gray-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>Direct access to GWD verified client deal flow and automated closing funnels.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>Guaranteed 15% (DA) or 10% (PM) commission plus squad profit share on every project.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>Priority incubation into GWD Orbit&apos;s AI & SaaS product lines as future spin-off founders.</span>
            </div>
          </div>

          <div className="mt-8">
            {contractAccepted ? (
              <div className="p-4 rounded-2xl bg-green-600/30 border border-green-400 text-green-200 text-sm font-bold flex items-center justify-between">
                <span>🎉 Founding Contract Accepted! Welcome to the GWD Orbit Leadership Team.</span>
                <Badge variant="success" size="md">Contract Active ✓</Badge>
              </div>
            ) : (
              <button
                onClick={() => setContractAccepted(true)}
                className="px-8 py-4 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white font-extrabold rounded-2xl text-sm md:text-base transition-all shadow-lg hover:scale-[1.02] flex items-center gap-2.5"
              >
                <span>Accept Founding Partner Contract</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
