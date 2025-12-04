'use client';

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
}

/**
 * Input component with label, error messages, and icon support
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   error="Invalid email address"
 * />
 *
 * <Input
 *   label="Search"
 *   placeholder="Search events..."
 *   icon={<SearchIcon />}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      helperText,
      className = '',
      disabled = false,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    const inputStyles = `
      w-full px-4 py-3
      bg-gray-800
      border ${hasError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'}
      rounded-xl
      text-white placeholder-gray-500
      transition-all duration-200
      focus:outline-none focus:ring-4
      disabled:opacity-50 disabled:cursor-not-allowed
      ${icon ? 'pl-12' : ''}
    `.trim();

    return (
      <div className={`flex flex-col gap-2 ${className}`.trim()}>
        {label && (
          <label className="text-sm font-semibold text-gray-300">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={inputStyles}
            disabled={disabled}
            {...props}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-sm text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
