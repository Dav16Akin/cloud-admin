import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'green';
}

const variantClass: Record<string, string> = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-[#e8900a]/10 text-[#e8900a]',
  warning: 'bg-[#f5a520]/10 text-[#f5a520]',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-[#1a2a5a]/10 text-[#1a2a5a]',
  green: 'bg-[#16a34a]/10 text-[#16a34a]',
};

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium border border-border',
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
