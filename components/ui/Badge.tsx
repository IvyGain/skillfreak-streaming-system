'use client';

import { HTMLAttributes, forwardRef } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-black',
  error: 'bg-red-500 text-white',
  info: 'bg-purple-600 text-white',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

/**
 * Badge component for status indicators and labels
 *
 * @example
 * ```tsx
 * <Badge variant="success" size="md">
 *   Live
 * </Badge>
 *
 * <Badge variant="error" size="sm">
 *   Error
 * </Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'info', size = 'md', className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center gap-1.5 rounded-full font-semibold';

    return (
      <span
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
