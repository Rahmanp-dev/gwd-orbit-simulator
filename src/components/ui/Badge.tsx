'use client';

import { memo, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-semibold rounded-full whitespace-nowrap leading-none flex-shrink-0 max-w-full truncate',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--crimson-pale)] text-[var(--crimson)]',
        success:
          'bg-[var(--success-pale)] text-[var(--success)]',
        warning:
          'bg-[var(--warning-pale)] text-[var(--warning)]',
        danger:
          'bg-[var(--crimson)] text-white',
        info:
          'bg-blue-50 text-blue-700',
        outline:
          'bg-transparent border border-[var(--border-strong)] text-[var(--text-secondary)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode;
  className?: string;
}

export const Badge = memo(function Badge({ variant, size, children, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {children}
    </span>
  );
});

export default Badge;
