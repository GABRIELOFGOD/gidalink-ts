'use client';
import { EyeOff, Eye } from 'lucide-react';

interface Props {
  isAnonymous: boolean;
  onChange: (v: boolean) => void;
  context?: 'listing' | 'review' | 'roommate';
}

const copy: Record<string, { on: string; off: string }> = {
  listing:  { on: "Your name and photo won't be shown on this listing — only \"Anonymous\" with a generated avatar.", off: 'Your name, profile photo, and role will be visible on this listing.' },
  review:   { on: "Your name won't be shown on this review — only \"Anonymous\" with a generated avatar.", off: 'Your name and profile photo will be visible on this review.' },
  roommate: { on: "Your name won't be shown on this post — only \"Anonymous\" with a generated avatar.", off: 'Your name will be visible on this roommate post.' },
};

export default function AnonymityToggle({ isAnonymous, onChange, context = 'listing' }: Props) {
  const text = copy[context];
  return (
    <div className={`rounded-xl border-2 p-4 transition-colors ${isAnonymous ? 'border-primary bg-primary-light' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isAnonymous ? <EyeOff className="w-4 h-4 text-primary shrink-0" /> : <Eye className="w-4 h-4 text-gray-400 shrink-0" />}
          <span className="text-sm font-semibold text-gray-800">Post Anonymously</span>
        </div>
        <button type="button" onClick={() => onChange(!isAnonymous)} className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${isAnonymous ? 'bg-primary' : 'bg-gray-300'}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isAnonymous ? 'translate-x-0' : '-translate-x-5'}`} />
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{isAnonymous ? text.on : text.off}</p>
    </div>
  );
}
