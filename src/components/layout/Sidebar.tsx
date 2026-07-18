'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useUserRole } from '@/hooks/useUserRole';
import { useDeals, useNotifications } from '@/hooks/useData';
import {
  LayoutDashboard,
  Trophy,
  Clock,
  PlusCircle,
  Briefcase,
  Columns3,
  MessageSquare,
  FileText,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Orbit,
  Target,
  Users,
  Shield,
  Activity,
  Award,
  Sparkles,
  PieChart,
  UserCheck,
  LogOut,
  X,
  Zap,
  Radio,
  ClipboardList,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

/* ── Types ──────────────────────────────────────────────────── */
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: 'deals' | 'notifications' | 'pendingVerify';
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

/* ── Role-specific navigation configs ───────────────────────── */

const NAV_ORGANIZER: NavGroup[] = [
  {
    title: 'COMMAND CENTER',
    items: [
      { label: 'Live Dashboard',        href: '/organizer',     icon: Activity },
      { label: 'Event Controls',        href: '/admin/events',  icon: Radio },
      { label: 'Deal Verify Queue',     href: '/admin/deals',   icon: ClipboardList, badgeKey: 'pendingVerify' },
      { label: 'Participant Directory', href: '/admin/users',   icon: Users },
      { label: 'System Health',         href: '/admin/health',  icon: Shield },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'Leaderboard',     href: '/leaderboard',   icon: Trophy },
      { label: 'Analytics',       href: '/analytics',     icon: BarChart3 },
      { label: 'Grand Finale',    href: '/finale',        icon: Sparkles },
      { label: 'Retrospective',   href: '/retrospective', icon: PieChart },
    ],
  },
  {
    title: 'COMMUNICATIONS',
    items: [
      { label: 'War Room',        href: '/war-room',      icon: MessageSquare },
      { label: 'Notifications',   href: '/notifications', icon: Bell, badgeKey: 'notifications' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Profile Settings', href: '/settings', icon: Settings },
    ],
  },
];

const NAV_ADMIN: NavGroup[] = [
  {
    title: 'MY QUEUE',
    items: [
      { label: 'Pending Deal Inbox', href: '/admin/deals',   icon: ClipboardList, badgeKey: 'pendingVerify' },
      { label: 'All Deals',          href: '/admin/deals?status=all', icon: Briefcase },
      { label: 'User Directory',     href: '/admin/users',   icon: Users },
    ],
  },
  {
    title: 'CONTEXT',
    items: [
      { label: 'Leaderboard',   href: '/leaderboard',  icon: Trophy },
      { label: 'Event Status',  href: '/admin/events', icon: Activity },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Notifications', href: '/notifications', icon: Bell, badgeKey: 'notifications' },
      { label: 'Settings',      href: '/settings',      icon: Settings },
    ],
  },
];

const NAV_JUDGE: NavGroup[] = [
  {
    title: 'EVALUATION',
    items: [
      { label: 'Judge Panel',   href: '/judge',         icon: Award },
      { label: 'Leaderboard',   href: '/leaderboard',   icon: Trophy },
      { label: 'Retrospective', href: '/retrospective', icon: PieChart },
    ],
  },
  {
    title: 'CONTEXT',
    items: [
      { label: 'War Room (Read)', href: '/war-room',      icon: MessageSquare },
      { label: 'Notifications',   href: '/notifications', icon: Bell, badgeKey: 'notifications' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

// Sub-role nav configs for participants
const NAV_PARTICIPANT_DA: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard',     href: '/dashboard',   icon: LayoutDashboard },
      { label: 'Leaderboard',   href: '/leaderboard', icon: Trophy },
      { label: 'Timeline',      href: '/timeline',    icon: Clock },
    ],
  },
  {
    title: 'LEADS & DEALS',
    items: [
      { label: 'Niche & Leads', href: '/niche',       icon: Target },
      { label: 'New Deal',      href: '/deals/new',   icon: PlusCircle },
      { label: 'My Deals',      href: '/deals',       icon: Briefcase, badgeKey: 'deals' },
    ],
  },
  {
    title: 'MY TEAM',
    items: [
      { label: 'Team Chat',     href: '/war-room', icon: MessageSquare },
      { label: 'Team Profile',  href: '/team',     icon: Users },
      { label: 'Daily Briefing',href: '/briefing', icon: FileText },
    ],
  },
  {
    title: 'MY PROGRESS',
    items: [
      { label: 'My Score',      href: '/analytics',     icon: Zap },
      { label: 'Notifications', href: '/notifications', icon: Bell, badgeKey: 'notifications' },
      { label: 'Settings',      href: '/settings',      icon: Settings },
    ],
  },
];

const NAV_PARTICIPANT_PM: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'PM Dashboard',  href: '/dashboard/pm', icon: LayoutDashboard },
      { label: 'Leaderboard',   href: '/leaderboard',  icon: Trophy },
      { label: 'Timeline',      href: '/timeline',     icon: Clock },
    ],
  },
  {
    title: 'DELIVERY',
    items: [
      { label: 'Kanban Board',  href: '/deals/kanban', icon: Columns3 },
      { label: 'All Team Deals',href: '/deals',        icon: Briefcase, badgeKey: 'deals' },
    ],
  },
  {
    title: 'MY TEAM',
    items: [
      { label: 'Team Chat',      href: '/war-room', icon: MessageSquare },
      { label: 'Team Profile',   href: '/team',     icon: Users },
      { label: 'Daily Briefing', href: '/briefing', icon: FileText },
    ],
  },
  {
    title: 'MY PROGRESS',
    items: [
      { label: 'My Score',      href: '/analytics',     icon: Zap },
      { label: 'Notifications', href: '/notifications', icon: Bell, badgeKey: 'notifications' },
      { label: 'Settings',      href: '/settings',      icon: Settings },
    ],
  },
];

const NAV_PARTICIPANT_DEV: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard },
      { label: 'Leaderboard',  href: '/leaderboard',  icon: Trophy },
      { label: 'Timeline',     href: '/timeline',     icon: Clock },
    ],
  },
  {
    title: 'MY BUILDS',
    items: [
      { label: 'Kanban Board',      href: '/deals/kanban', icon: Columns3 },
      { label: 'My Assigned Deals', href: '/deals',        icon: Briefcase, badgeKey: 'deals' },
    ],
  },
  {
    title: 'MY TEAM',
    items: [
      { label: 'Team Chat',      href: '/war-room', icon: MessageSquare },
      { label: 'Team Profile',   href: '/team',     icon: Users },
      { label: 'Daily Briefing', href: '/briefing', icon: FileText },
    ],
  },
  {
    title: 'MY PROGRESS',
    items: [
      { label: 'My Score',      href: '/analytics',     icon: Zap },
      { label: 'Notifications', href: '/notifications', icon: Bell, badgeKey: 'notifications' },
      { label: 'Settings',      href: '/settings',      icon: Settings },
    ],
  },
];

/** Pick the right nav config for the current user */
function resolveNav(
  role: string,
  participantRole: string
): NavGroup[] {
  if (role === 'organizer') return NAV_ORGANIZER;
  if (role === 'admin')     return NAV_ADMIN;
  if (role === 'judge')     return NAV_JUDGE;

  // Participant — sub-role aware
  if (participantRole === 'project_manager') return NAV_PARTICIPANT_PM;
  if (participantRole === 'developer' || participantRole === 'designer') return NAV_PARTICIPANT_DEV;
  return NAV_PARTICIPANT_DA; // default: deal_architect + wildcard
}

/** Human-readable sub-role label */
const SUB_ROLE_LABELS: Record<string, string> = {
  deal_architect:  'Deal Architect',
  project_manager: 'Project Manager',
  developer:       'Developer',
  designer:        'Designer',
  wildcard:        'Wildcard',
};

/* ── Sidebar Component ──────────────────────────────────────── */
export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function Sidebar({ collapsed, onToggle, className }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const {
    role: userRole,
    participantRole,
    name: userName,
    initials: userInitials,
    displayLabel,
    isParticipant,
  } = useUserRole();

  // Dynamic live-data badges
  const { data: dealsData } = useDeals();
  const { data: notificationsData } = useNotifications();

  const activeDealsCount   = dealsData?.deals?.length ?? 0;
  const unreadCount        = notificationsData?.unreadCount ?? 0;
  const pendingVerifyCount = dealsData?.deals?.filter((d: any) => d.status === 'admin_pending_contact').length ?? 0;

  const navigation = resolveNav(userRole, participantRole);

  const isActive = (href: string) => {
    if (href === '/dashboard')    return pathname === '/dashboard' || pathname === '/';
    if (href === '/organizer')    return pathname === '/organizer';
    
    const [baseHref, hrefQuery] = href.split('?');
    const isBaseActive = pathname.startsWith(baseHref);
    if (!isBaseActive) return false;

    if (hrefQuery) {
      const params = new URLSearchParams(hrefQuery);
      for (const [key, val] of params.entries()) {
        if (searchParams.get(key) !== val) return false;
      }
      return true;
    } else {
      if (baseHref === '/admin/deals' && statusParam === 'all') {
        return false;
      }
      return true;
    }
  };

  const resolveBadge = (key?: NavItem['badgeKey']): number | undefined => {
    if (!key) return undefined;
    if (key === 'deals')         return activeDealsCount;
    if (key === 'notifications') return unreadCount;
    if (key === 'pendingVerify') return pendingVerifyCount;
    return undefined;
  };

  // Sub-role pill label shown in footer for participants
  const subRolePill = isParticipant
    ? (SUB_ROLE_LABELS[participantRole] ?? 'Participant')
    : null;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--surface-glass)] backdrop-blur-xl border-r transition-all duration-300 shadow-sm',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        className
      )}
      style={{ borderColor: 'var(--border)' }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 sm:px-5 h-20 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2.5 group">
          <img src="/logo-red.png" alt="GWD Logo" className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          {!collapsed && (
            <div className="flex flex-col leading-tight animate-fade-in">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--crimson)] flex items-center gap-1">
                <span className="live-ring" style={{ transform: 'scale(0.7)' }} />
                Orbit OS
              </span>
            </div>
          )}
        </div>

        {/* Mobile close */}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="lg:hidden flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg transition-all hover:bg-[var(--surface-alt)] active:scale-95"
            aria-label="Close sidebar"
          >
            <X size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 no-scrollbar">
        {navigation.map((group) => (
          <div key={group.title} className="stagger">
            {!collapsed && (
              <p
                className="px-3 mb-2 text-[10px] font-bold tracking-[0.14em] uppercase font-mono"
                style={{ color: 'var(--text-muted)' }}
              >
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const badgeValue = resolveBadge(item.badgeKey);

                return (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-200 relative min-h-[44px] overflow-hidden',
                        collapsed ? 'justify-center px-2 py-2.5' : 'px-3.5 py-2.5',
                        active
                          ? 'text-[var(--crimson)] bg-[var(--crimson-pale)] shadow-[var(--shadow-xs)] font-bold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-alt)] hover:translate-x-1 active:scale-[0.98]'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {/* Active indicator bar */}
                      <span
                        className={cn(
                          'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300',
                          active ? 'h-7 opacity-100' : 'h-0 opacity-0'
                        )}
                        style={{ background: 'var(--crimson)' }}
                      />
                      <item.icon
                        size={20}
                        strokeWidth={active ? 2.4 : 1.8}
                        className={cn(
                          'flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                          active && 'text-[var(--crimson)]'
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {badgeValue !== undefined && badgeValue > 0 && (
                            <Badge variant="danger" size="sm" className="font-mono px-1.5 py-0.5 pulse-soft">
                              {badgeValue}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer: User + Sub-role + Sign Out + Collapse ── */}
      <div
        className="flex-shrink-0 border-t px-3 py-3 space-y-1"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* User identity */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2 min-h-[44px] transition-colors hover:bg-[var(--surface-alt)]',
            collapsed && 'justify-center px-0'
          )}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
            style={{ background: 'var(--dark)' }}
          >
            {userInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {userName}
              </p>
              <p className="text-xs truncate text-[var(--crimson)] font-bold tracking-tight">
                {displayLabel}
              </p>
              {/* Sub-role pill for participants */}
              {subRolePill && (
                <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-[var(--surface-alt)] border border-[var(--border)] rounded text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {subRolePill}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sign Out — clearly separated */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'flex items-center justify-center w-full rounded-xl min-h-[44px] py-2 text-xs font-bold transition-all text-red-500 hover:text-red-600 hover:bg-red-500/10 active:scale-98',
            collapsed && 'px-0'
          )}
          title="Sign Out"
        >
          <LogOut size={16} />
          {!collapsed && <span className="ml-2 font-display">Sign Out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center justify-center w-full rounded-xl min-h-[44px] py-2 text-sm font-semibold transition-all',
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-alt)] active:scale-98'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="ml-2">Collapse Navigation</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
