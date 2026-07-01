'use client';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

const base = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input className={`${base} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}
export function Select({ label, error, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select className={`${base} ${error ? 'border-red-400' : ''} ${className}`} {...props}>{children}</select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea className={`${base} resize-none ${error ? 'border-red-400' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default Input;
