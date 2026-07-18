'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useEvent } from '@/hooks/useData';
import Link from 'next/link';
import { ShieldAlert, Lock, ArrowLeft, Target, PauseCircle, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header, type Breadcrumb } from '@/components/layout/Header';
import { EventTicker } from '@/components/layout/EventTicker';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { cn } from '@/lib/utils';

// Per-day mission objectives tied to the Arena format
const DAY_OBJECTIVES: Record<number, string> = {
  1: 'First contact day — reach out to at least 3 leads and introduce yourself.',
  2: 'Discovery day — book a demo call or send a preview link to 2 interested leads.',
  3: 'Proposal day — send your first formal proposal with pricing to a qualified lead.',
  4: 'Close day — secure verbal commitment and Razorpay advance from 1+ client.',
  5: 'Retainer day — pitch a monthly maintenance or SEO retainer to yesterday\'s closings.',
  6: 'Quality day — ensure all in-progress deliverables are on track. Review & fix.',
  7: '⚡ Wild Card Day — complete the special bonus challenge posted by the organizer.',
  8: 'Sprint day — final push to close any pending proposals. Every hour counts.',
  9: 'Finale day — submit your final numbers, prepare your team presentation.',
};

function DayObjectiveBanner({ currentDay, isPaused }: { currentDay: number; isPaused: boolean }) {
  if (isPaused) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2 flex items-center gap-2.5 text-sm">
        <PauseCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="font-bold text-amber-800">Event Paused</span>
        <span className="text-amber-700">
          — Deal submissions and lead claims are temporarily disabled. The War Room is still live.
        </span>
      </div>
    );
  }

  const objective = DAY_OBJECTIVES[currentDay];
  if (!objective) return null;

  return (
    <div className="bg-white border-b border-[var(--border)] px-4 sm:px-6 py-2 flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
      <Target className="w-3.5 h-3.5 text-[var(--crimson)] flex-shrink-0" />
      <span className="font-bold text-[var(--text-primary)] mr-1">Day {currentDay} Mission:</span>
      <span className="truncate">{objective}</span>
    </div>
  );
}

/* ── Props ─────────────────────────────────────────────── */
export interface DashboardLayoutProps {
  /** Page title displayed in the header */
  title: string;
  /** Optional breadcrumb trail — accepts strings or Breadcrumb objects */
  breadcrumbs?: (string | Breadcrumb)[];
  /** Notification count displayed on the bell icon */
  notificationCount?: number;
  /** Page content */
  children: ReactNode;
}

/* ── DashboardLayout Component ─────────────────────────── */
export function DashboardLayout({
  title,
  breadcrumbs,
  notificationCount,
  children,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { role: userRole, name: userName, isLoading } = useUserRole();
  const { data: eventData } = useEvent();

  // Normalize breadcrumbs: accept strings or Breadcrumb objects
  const normalizedBreadcrumbs: Breadcrumb[] = (breadcrumbs || []).map((b) =>
    typeof b === 'string' ? { label: b } : b
  );

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--surface-alt)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--crimson)] animate-duration-1000" />
      </div>
    );
  }

  // Route Protection & Executive Vault Access Check
  const isAdminRoute = pathname?.startsWith('/admin');
  const isOrganizerRoute = pathname?.startsWith('/organizer');
  const isJudgeRoute = pathname?.startsWith('/judge');

  let unauthorizedReason = null;
  if (isAdminRoute && userRole !== 'admin' && userRole !== 'organizer') {
    unauthorizedReason = {
      title: "GWD Executive & Admin Vault Protection",
      subtitle: `Access Denied for ${userName} (${userRole.toUpperCase()})`,
      description: "You are currently signed in as a Participant/DA. The confidential Client Vaults, deal verification queues, and system controls are restricted exclusively to GWD Verification Officers and the CEO/Organizer.",
    };
  } else if (isOrganizerRoute && userRole !== 'organizer') {
    unauthorizedReason = {
      title: "CEO & Organizer War Room Restricted",
      subtitle: `Access Denied for ${userName} (${userRole.toUpperCase()})`,
      description: "Only CEO Mohd Abdul Rahman Pasha and designated Event Organizers have clearance to manipulate master simulation variables, inject market events, and override team scores.",
    };
  } else if (isJudgeRoute && userRole !== 'judge' && userRole !== 'organizer') {
    unauthorizedReason = {
      title: "CII CIES Evaluation Panel Restricted",
      subtitle: `Access Denied for ${userName} (${userRole.toUpperCase()})`,
      description: "Only official CII CIES Judges and Event Chairs can access rubric evaluation sheets and submit official scores.",
    };
  }

  return (
    <div className="min-h-screen bg-[var(--surface-alt)] font-sans">
      {/* Mobile overlay with backdrop blur */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — hidden below lg, animated overlay on mobile when open */}
      <div
        className={cn(
          'hidden lg:block',
          mobileOpen && '!block !fixed inset-y-0 left-0 z-40 animate-slide-right shadow-2xl'
        )}
      >
        <Sidebar
          collapsed={mobileOpen ? false : sidebarCollapsed}
          onToggle={mobileOpen ? toggleMobile : toggleSidebar}
          className={cn(
            mobileOpen && '!w-[260px]'
          )}
        />
      </div>

      {/* Main content area */}
      <div
        className={cn(
          'transition-all duration-300',
          // Push content right by sidebar width on desktop
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        )}
      >
        <EventTicker />
        {eventData?.event && (
          <DayObjectiveBanner
            currentDay={eventData.event.currentDay || 1}
            isPaused={eventData.event.status === 'paused'}
          />
        )}
        <Header
          title={title}
          breadcrumbs={normalizedBreadcrumbs}
          notificationCount={notificationCount}
          onMenuToggle={toggleMobile}
        />
        <main className="p-4 sm:p-6 lg:p-8 page-transition">
          {unauthorizedReason ? (
            <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-white border border-red-200 shadow-lg text-center animate-fade-blur">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-3">
                <Lock className="w-3.5 h-3.5" /> Security Checkpoint
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-1">
                {unauthorizedReason.title}
              </h2>
              <p className="text-sm font-bold text-[var(--crimson)] mb-4">
                {unauthorizedReason.subtitle}
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 max-w-lg mx-auto">
                {unauthorizedReason.description}
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-xl bg-[var(--dark)] text-white font-bold text-xs hover:bg-black transition-all flex items-center gap-2 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to My Dashboard
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-xs hover:bg-gray-100 transition-all"
                >
                  Switch Role / Login
                </Link>
              </div>
            </div>
          ) : (
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

