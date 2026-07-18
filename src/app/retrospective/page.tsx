"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import {
  BarChart3,
  DollarSign,
  Briefcase,
  Users,
  Download,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  PieChart,
  Target,
  FileText,
} from "lucide-react";

import { useUserRole } from "@/hooks/useUserRole";
import { useEventDay } from "@/hooks/useEventDay";

export default function RetrospectivePage() {
  const { role } = useUserRole();
  const { currentDay, loading } = useEventDay();

  // Restrict to executives
  if (role !== "organizer" && role !== "admin" && role !== "judge") {
    // Relying on DashboardLayout for error UI if we want, or handle here. 
    // Actually, let's just return a generic locked screen.
    return (
      <DashboardLayout title="Executive Retrospective" breadcrumbs={["Home", "Retrospective"]}>
        <div className="flex flex-col items-center justify-center text-center p-12 min-h-[60vh]">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <Target className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-4">
            Executive Clearance Required
          </h1>
          <p className="text-[var(--text-secondary)] max-w-md">
            This report contains sensitive financial and performance data reserved for the GWD CEO, Verification Officers, and CII CIES Judges.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!loading && currentDay < 9) {
    return (
      <DashboardLayout title="Executive Retrospective" breadcrumbs={["Home", "Retrospective"]}>
        <div className="flex flex-col items-center justify-center text-center p-12 min-h-[60vh]">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-4">
            Retrospective Locked
          </h1>
          <p className="text-[var(--text-secondary)] max-w-md">
            The Executive Retrospective Report will be generated at the conclusion of the 9-Day Orbit Odyssey.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Post-Event Retrospective" breadcrumbs={["Home", "Retrospective"]}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-[var(--crimson)] text-white text-[10px] font-bold uppercase tracking-wider">
              CII CIES & Adonmo Executive Report
            </span>
            <Badge variant="success" size="sm">Event Completed ● 9 Days</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
            BizSim 2026 Comprehensive Retrospective
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Full quantitative breakdown of participant performance, micro-agency conversion rates, and industry digital gaps.
          </p>
        </div>

        <button
          onClick={() => alert("Downloading executive report PDF (bizsim_2026_retrospective_report.pdf)...")}
          className="px-5 py-2.5 bg-[var(--dark)] hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
        >
          <Download className="w-4 h-4" /> Download Executive Report PDF
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value="₹4,85,000" label="Total Verified Closed Revenue" icon={DollarSign} trend="up" trendValue="+304% ROI vs Prize Pool" />
        <StatCard value="31 deals" label="Real Businesses Digitalized" icon={Briefcase} trend="up" trendValue="Across 4 cities" />
        <StatCard value="14.2 hrs" label="Avg. Speed to Close (Pitch → Pay)" icon={Clock} trend="up" trendValue="Record turnaround" />
        <StatCard value="39 squads" label="Micro-Agencies Incubated" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Revenue Breakdown by Industry Vertical */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Verified Revenue by Industry Niche
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Healthcare & Dental proved highest in ticket value and immediate conversion.
                </p>
              </div>
              <PieChart className="w-5 h-5 text-[var(--crimson)]" />
            </div>

            <div className="space-y-4">
              {[
                { name: "Healthcare & Dental Clinics", revenue: 185000, percentage: 38, deals: 11, color: "bg-[var(--crimson)]" },
                { name: "F&B, Cafés & Cloud Kitchens", revenue: 135000, percentage: 28, deals: 9, color: "bg-blue-600" },
                { name: "Real Estate & Interior Design", revenue: 115000, percentage: 24, deals: 7, color: "bg-purple-600" },
                { name: "EdTech & Coaching Institutes", revenue: 50000, percentage: 10, deals: 4, color: "bg-amber-500" },
              ].map((niche) => (
                <div key={niche.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[var(--text-primary)]">{niche.name} ({niche.deals} deals)</span>
                    <span className="text-[var(--crimson)]">₹{(niche.revenue / 1000).toFixed(0)}K ({niche.percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-[var(--surface-alt)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div className={`h-full ${niche.color} rounded-full transition-all`} style={{ width: `${niche.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Findings Card */}
          <div className="card p-6 border border-[var(--border)] shadow-sm space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-[var(--crimson)]" /> Key Strategic Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
                <strong className="text-[var(--text-primary)] block mb-1">1. Razorpay Advance Velocity:</strong>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Teams that required a 50% advance via automated Razorpay links closed 3.4x faster than teams relying on bank wire instructions.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
                <strong className="text-[var(--text-primary)] block mb-1">2. Interactive Mockup Advantage:</strong>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Sending live Vercel preview links during the first discovery call increased closing probability from 22% to 68%.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Top Closers & Squad Performance */}
        <div className="space-y-6">
          <div className="card p-6 border border-[var(--border)] shadow-sm">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--crimson)]" /> Top Individual Revenue Closers
            </h3>

            <div className="space-y-3.5">
              {[
                { name: "Arjun Reddy (Phoenix)", role: "DA", closed: "₹1.42L", deals: 5 },
                { name: "Priya Sharma (Titan)", role: "DA", closed: "₹1.28L", deals: 4 },
                { name: "Ravi Kumar (Rocket)", role: "DA", closed: "₹1.15L", deals: 4 },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--dark)] text-white text-xs font-bold flex items-center justify-center">
                      #{i + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">{c.name}</div>
                      <span className="text-[10px] text-[var(--crimson)] font-semibold">{c.role} Role</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-[var(--crimson)]">{c.closed}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-medium">{c.deals} closes</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick link back */}
          <div className="card p-5 border border-[var(--border)] shadow-sm">
            <h3 className="font-bold text-sm mb-2">Ready for Next Event Orbit?</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Check how the GWD Orbit micro-agency structure will transition into long-term product verticals.
            </p>
            <Link
              href="/organizer"
              className="w-full py-2.5 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Back to Organizer War Room</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
