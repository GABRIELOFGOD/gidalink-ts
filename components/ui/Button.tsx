'use client';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'secondary' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   'bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2',
  accent:    'bg-accent text-white hover:bg-accent-dark focus:ring-2 focus:ring-accent focus:ring-offset-2',
  outline:   'border-2 border-primary text-primary hover:bg-primary-light focus:ring-2 focus:ring-primary focus:ring-offset-2',
  ghost:     'text-primary hover:bg-primary-light focus:ring-2 focus:ring-primary focus:ring-offset-2',
  danger:    'bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
};
const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export default function Button({
  children, variant = 'primary', size = 'md', className = '', loading = false, disabled = false, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
