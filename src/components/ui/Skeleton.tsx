'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton — Animated placeholder for loading states.
 * Matches the GWD Orbit design system's shimmer style.
 */
interface SkeletonProps {
  className?: string;
}

export const Skeleton = memo(function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-[var(--surface-alt)]',
        className
      )}
      aria-hidden="true"
    />
  );
});

/**
 * StatCardSkeleton — Placeholder for a loading StatCard (same dimensions).
 */
export const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
      </div>
    </div>
  );
});

/**
 * DealCardSkeleton — Placeholder for a loading deal list item.
 */
export const DealCardSkeleton = memo(function DealCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="flex items-center gap-3 mr-4">
        <div className="text-right space-y-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  );
});

/**
 * PageLoadingSpinner — Full-page centered spinner for route transitions.
 */
export const PageLoadingSpinner = memo(function PageLoadingSpinner({
  message = 'Loading...',
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-8 h-8 border-2 border-[var(--crimson)] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[var(--text-muted)] font-medium">{message}</p>
    </div>
  );
});

export default Skeleton;
