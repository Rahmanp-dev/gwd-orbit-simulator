"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import {
  Briefcase,
  Columns3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  FileText,
  Upload,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  Loader2,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const PM_PROJECTS = [
  {
    id: "d101",
    client: "Sunshine Dental Clinic",
    service: "Booking Engine + SEO",
    value: 35000,
    daOwner: "Arjun Reddy",
    devOwner: "Ravi Kumar",
    stage: "In Build (Day 2 of 3)",
    progress: 65,
    status: "on_track",
    nextMilestone: "Deploy interactive booking calendar to Vercel by 4:00 PM today.",
  },
  {
    id: "d102",
    client: "Bloom Boutique Fashion",
    service: "Shopify Store + Custom UI",
    value: 45000,
    daOwner: "Arjun Reddy",
    devOwner: "Priya Sharma (Des)",
    stage: "Agreement & Advance Pending",
    progress: 20,
    status: "action_needed",
    nextMilestone: "Client requested Razorpay payment link modification. Resend custom invoice.",
  },
  {
    id: "d103",
    client: "City Gym & Physio Care",
    service: "Landing Page + Lead Generation Bot",
    value: 18000,
    daOwner: "Sneha Patel",
    devOwner: "Ravi Kumar",
    stage: "Delivered & Under QA",
    progress: 90,
    status: "review_ready",
    nextMilestone: "Perform Lighthouse audit and send sign-off audio request to Vikram Reddy.",
  },
];

export default function PMDashboardPage() {
  const { role, participantRole, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <DashboardLayout title="PM Delivery Hub" breadcrumbs={["Home", "Dashboard", "Project Manager"]}>
        <div className="flex items-center justify-center py-20 text-sm text-[var(--text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin mr-3 text-[var(--crimson)]" />
          Loading Project Manager dashboard...
        </div>
      </DashboardLayout>
    );
  }

  if (role === 'participant' && participantRole !== 'project_manager') {
    return (
      <DashboardLayout title="PM Delivery Hub" breadcrumbs={['Home', 'Dashboard']}>
        <div className="flex flex-col items-center justify-center text-center p-12 min-h-[60vh]">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-6">
            <Columns3 className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-3">Project Manager Access Only</h2>
          <p className="text-[var(--text-secondary)] max-w-md">The PM Delivery Hub is for Project Managers only. Your Deal Architect dashboard is at <a href='/dashboard' className='text-[var(--crimson)] font-bold underline'>My Dashboard</a>.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="PM Delivery Hub" breadcrumbs={["Home", "Dashboard", "Project Manager"]}>
      {/* Role Switcher & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-[var(--dark)] text-white text-[10px] font-bold uppercase tracking-wider">
              Project Manager Mode
            </span>
            <Badge variant="success" size="sm">Active Sprint: Day 4</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
            Delivery & Execution Command Center
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Oversee active build pipelines, eliminate developer bottlenecks, and lock in client sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold hover:bg-[var(--surface-alt)] transition-colors"
          >
            Switch to DA Dashboard
          </Link>
          <Link
            href="/deals/kanban"
            className="px-4 py-2 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Columns3 className="w-3.5 h-3.5" /> Board View
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value="3 active" label="Managed Projects" icon={Briefcase} />
        <StatCard value="65%" label="Average Sprint Velocity" icon={Activity} trend="up" trendValue="+12% this week" />
        <StatCard value="1 action" label="Bottlenecks / Alerts" icon={AlertTriangle} />
        <StatCard value="₹98,000" label="Pipeline Delivery Value" icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Project Execution List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Active Delivery Milestones ({PM_PROJECTS.length})
            </h2>
            <span className="text-xs text-[var(--text-muted)] font-medium">Sorted by urgency</span>
          </div>

          {PM_PROJECTS.map((project) => (
            <div key={project.id} className="card p-5 border border-[var(--border)] bg-white shadow-sm hover:border-[var(--crimson)] transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-xs font-bold text-[var(--text-muted)]">#{project.id}</span>
                    {project.status === "on_track" && <Badge variant="success" size="sm">On Track</Badge>}
                    {project.status === "action_needed" && <Badge variant="danger" size="sm">Action Required</Badge>}
                    {project.status === "review_ready" && <Badge variant="warning" size="sm">Review & QA Ready</Badge>}
                  </div>
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)]">{project.client}</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{project.service}</p>
                </div>

                <div className="text-left md:text-right flex-shrink-0">
                  <div className="text-lg font-black text-[var(--crimson)]">₹{project.value.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Project Value</div>
                </div>
              </div>

              {/* Progress Bar & Next Milestone */}
              <div className="pt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[var(--text-secondary)]">{project.stage}</span>
                    <span className="text-[var(--crimson)]">{project.progress}% completed</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--surface-alt)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div
                      className="h-full bg-[var(--crimson)] transition-all rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-xs flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="text-[var(--text-primary)]">Immediate PM Action:</strong>
                    <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">{project.nextMilestone}</p>
                  </div>
                </div>

                {/* Team Assignment Row & Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-medium">
                    <span>DA: <strong className="text-[var(--text-primary)]">{project.daOwner}</strong></span>
                    <span>•</span>
                    <span>Lead Dev: <strong className="text-[var(--text-primary)]">{project.devOwner}</strong></span>
                  </div>

                  <Link
                    href={`/deals/${project.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--dark)] text-white hover:bg-black text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Update Milestone</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right 1 Col: PM Tools & Agreement Generator */}
        <div className="space-y-6">
          {/* Quick Agreement Generator Box */}
          <div className="card p-5 border border-[var(--border)] shadow-sm bg-gradient-to-br from-white to-[var(--surface-alt)]">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-[var(--crimson)]" />
              <h3 className="font-bold text-sm">GWD Agreement Generator</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              Instantly generate client-ready onboarding agreements with custom Razorpay payment gateways attached.
            </p>
            <button
              onClick={() => alert("Generating GWD Standard Service Agreement PDF with Razorpay gateway link...")}
              className="w-full py-2.5 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>Generate Standard Agreement</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PM Checklist for Today */}
          <div className="card p-5 border border-[var(--border)] shadow-sm">
            <h3 className="font-bold text-sm mb-3.5">PM Daily Checklist</h3>
            <div className="space-y-2.5 text-xs">
              {[
                { text: "Confirm 50% advance payment from Sunshine Dental", done: true },
                { text: "Perform 5-point QA audit on Vercel preview build", done: false },
                { text: "Upload client signed invoice to Deal #101 evidence", done: true },
                { text: "Pre-schedule Day 5 developer task assignments", done: false },
              ].map((item, i) => (
                <label key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-[var(--surface-alt)] cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={item.done}
                    className="mt-0.5 rounded border-[var(--border-strong)] text-[var(--crimson)] focus:ring-[var(--crimson)]"
                  />
                  <span className={item.done ? "line-through text-[var(--text-muted)]" : "font-medium text-[var(--text-primary)]"}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Team Communication link */}
          <div className="card p-5 border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[var(--crimson)]" />
              <h3 className="font-bold text-sm">Squad War Room</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Need immediate updates from your developer or UI designer? Check the live team chat.
            </p>
            <Link
              href="/team"
              className="w-full py-2 border border-[var(--border)] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--surface-alt)] transition-colors"
            >
              <span>Go to War Room</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
