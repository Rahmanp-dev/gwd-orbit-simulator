'use client';

import { memo } from 'react';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  /** The main metric value, e.g. "$42.5K" */
  value: string;
  /** Descriptor shown below the value */
  label: string;
  /** Optional Lucide icon rendered in a crimson-pale circle */
  icon?: LucideIcon;
  /** Optional trend direction */
  trend?: 'up' | 'down';
  /** Optional trend percentage string, e.g. "+12.4%" */
  trendValue?: string;
  className?: string;
}

export const StatCard = memo(function StatCard({
  value,
  label,
  icon: Icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <div className={cn('card card-hover', className)}>
      <div className="flex items-start justify-between">
        {/* Left: metric */}
        <div className="min-w-0">
          <p className="stat-value">{value}</p>
          <p className="stat-label">{label}</p>
        </div>

        {/* Right: icon */}
        {Icon && (
          <div
            className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full"
            style={{ background: 'var(--crimson-pale)' }}
          >
            <Icon
              size={20}
              style={{ color: 'var(--crimson)' }}
              strokeWidth={2}
            />
          </div>
        )}
      </div>

      {/* Trend indicator */}
      {trend && trendValue && (
        <div className="mt-3 flex items-center gap-1 text-sm font-medium">
          {trend === 'up' ? (
            <>
              <TrendingUp size={14} style={{ color: 'var(--success)' }} />
              <span style={{ color: 'var(--success)' }}>{trendValue}</span>
            </>
          ) : (
            <>
              <TrendingDown size={14} style={{ color: 'var(--crimson)' }} />
              <span style={{ color: 'var(--crimson)' }}>{trendValue}</span>
            </>
          )}
          <span className="text-[var(--text-muted)] ml-1 text-xs">
            vs last period
          </span>
        </div>
      )}
    </div>
  );
});

export default StatCard;
