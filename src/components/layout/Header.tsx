'use client';

import { Bell, Menu, ChevronRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useUserRole } from '@/hooks/useUserRole';
import { useNotifications } from '@/hooks/useData';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

/* Types */
export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface HeaderProps {
  /** Page title displayed in the header */
  title: string;
  /** Optional breadcrumb trail */
  breadcrumbs?: Breadcrumb[];
  /** Notification count shown on bell icon */
  notificationCount?: number;
  /** Callback to toggle mobile sidebar */
  onMenuToggle?: () => void;
  className?: string;
}

/* Header Component */
export function Header({
  title,
  breadcrumbs = [],
  notificationCount,
  onMenuToggle,
  className,
}: HeaderProps) {
  const { name: userName, initials: userInitials, shortTag } = useUserRole();
  const { data: notificationsData } = useNotifications();

  // If no notificationCount is passed explicitly, default to the live unread count
  const activeNotificationCount = notificationCount !== undefined 
    ? notificationCount 
    : (notificationsData?.unreadCount ?? 0);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[var(--surface-glass)] backdrop-blur-md border-b transition-all duration-300',
        className
      )}
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Left: hamburger + title + breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile hamburger */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-xl transition-colors hover:bg-[var(--surface-alt)] active:scale-95"
            aria-label="Toggle sidebar"
          >
            <Menu size={22} style={{ color: 'var(--text-primary)' }} />
          </button>
        )}

        <div className="min-w-0">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 mb-0.5 overflow-x-auto no-scrollbar">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1 text-xs whitespace-nowrap">
                  {i > 0 && (
                    <ChevronRight
                      size={12}
                      className="flex-shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    />
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="link-underline transition-colors hover:text-[var(--crimson)]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <h1
            className="text-lg sm:text-xl font-bold truncate font-display tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification bell */}
        <Link
          href="/notifications"
          className="group relative flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl transition-all hover:bg-[var(--surface-alt)] active:scale-95"
          aria-label="View notifications"
        >
          <Bell size={20} className="transition-transform group-hover:rotate-12" style={{ color: 'var(--text-secondary)' }} />
          {activeNotificationCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--crimson)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--crimson)] pulse-soft"></span>
            </span>
          )}
        </Link>

        {/* User profile link */}
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-xl min-h-[44px] px-2 sm:px-3 py-1.5 transition-all hover:bg-[var(--surface-alt)] hover:border-[var(--border-strong)] border border-[var(--border)] active:scale-98 group"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--dark), #2A2A35)' }}
          >
            {userInitials}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span
              className="text-xs font-extrabold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {userName}
            </span>
            <span className="text-[10px] text-[var(--crimson)] font-bold mt-0.5 tracking-wide uppercase">
              {shortTag}
            </span>
          </div>
        </Link>

        {/* Quick Sign Out button */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border)] transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 text-[var(--text-secondary)] active:scale-95"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
