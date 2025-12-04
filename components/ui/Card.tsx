'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

/**
 * Card component with optional glassmorphism and hover effects
 *
 * @example
 * ```tsx
 * <Card hover>
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * <Card glass className="p-6">
 *   <p>Glassmorphism card</p>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = true, glass = false, className = '', ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-200';

    const backgroundStyles = glass
      ? 'bg-gray-900/80 backdrop-blur-xl border border-purple-500/20'
      : 'bg-gray-800 border border-purple-900/30 shadow-lg';

    const hoverStyles = hover
      ? 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50'
      : '';

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${backgroundStyles}
          ${hoverStyles}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
