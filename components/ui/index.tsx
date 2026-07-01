'use client';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

// ── Badge ──────────────────────────────────────────────
type BadgeVariant = 'indigo' | 'orange' | 'green' | 'yellow' | 'red' | 'gray' | 'blue';
const badgeVariants: Record<BadgeVariant, string> = {
  indigo: 'bg-primary-light text-primary-dark',
  orange: 'bg-accent-light text-accent-dark',
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  red:    'bg-red-100 text-red-700',
  gray:   'bg-gray-100 text-gray-600',
  blue:   'bg-blue-100 text-blue-700',
};
export function Badge({ children, variant = 'indigo', className = '' }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeVariants[variant]} ${className}`}>{children}</span>;
}

// ── Avatar ─────────────────────────────────────────────
const avatarSizes: Record<string, string> = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
export function Avatar({ src, name = '', size = 'md', className = '' }: { src?: string; name?: string; size?: 'sm'|'md'|'lg'|'xl'; className?: string }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={`rounded-full object-cover ${avatarSizes[size]} ${className}`} />;
  }
  return (
    <div className={`rounded-full bg-primary-light text-primary-dark font-bold flex items-center justify-center shrink-0 ${avatarSizes[size]} ${className}`}>
      {initials || '?'}
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────
const spinnerSizes: Record<string, string> = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
export function Spinner({ size = 'md', className = '' }: { size?: 'sm'|'md'|'lg'; className?: string }) {
  return (
    <svg className={`animate-spin text-primary ${spinnerSizes[size]} ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── StarRating ─────────────────────────────────────────
const starSizes: Record<string, string> = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };
export function StarRating({ value = 0, max = 5, onChange, size = 'md', readonly = false }: { value?: number; max?: number; onChange?: (v: number) => void; size?: 'sm'|'md'|'lg'; readonly?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button key={i} type="button" onClick={() => !readonly && onChange?.(i + 1)}
          className={`${starSizes[size]} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}>
          <svg viewBox="0 0 20 20" fill={i < value ? '#4F46E5' : 'none'} stroke={i < value ? '#4F46E5' : '#D1D5DB'} strokeWidth="1.5">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; maxWidth?: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────
export function Toggle({ checked, onChange, label, sublabel }: { checked: boolean; onChange: (v: boolean) => void; label?: string; sublabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      {(label || sublabel) && (
        <div>
          {label && <p className="text-sm font-semibold text-gray-800">{label}</p>}
          {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
        </div>
      )}
      <button type="button" onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-primary' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-0' : '-translate-x-5'}`} />
      </button>
    </div>
  );
}
