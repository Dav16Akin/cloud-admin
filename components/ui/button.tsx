'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant =
  | 'primary'
  | 'navy'
  | 'white'
  | 'outline'
  | 'outline-white'
  | 'outline-orange'
  | 'outline-navy';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'default' | 'sm';
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  navy: 'btn-navy',
  white: 'btn-white',
  outline: 'btn-outline',
  'outline-white': 'btn-outline-white',
  'outline-orange': 'btn-outline-orange',
  'outline-navy': 'btn-outline-navy',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(variantClass[variant], size === 'sm' && 'btn-sm', className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
