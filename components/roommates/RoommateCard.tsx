'use client';
import Link from 'next/link';
import { GraduationCap, MapPin, Wallet, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/index';
import AnonymousAvatar from '@/components/ui/AnonymousAvatar';
import { formatCurrency, timeAgo } from '@/lib/utils';
import type { IRoommateRequest } from '@/types';

const genderColors: Record<string, 'blue' | 'orange' | 'gray'> = { Male: 'blue', Female: 'orange', Any: 'gray' };

export default function RoommateCard({ request }: { request: IRoommateRequest }) {
  const { _id, isAnonymous, displayName, university, level, gender, budget, preferredArea, state, description, hasListingDetails, createdAt } = request;

  return (
    <Link href={`/roommates/${_id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-5">
        <div className="flex items-start gap-3 mb-3">
          {isAnonymous ? <AnonymousAvatar seed={_id} size="md" /> : (
            <div className="w-10 h-10 rounded-full bg-accent-light text-accent-dark font-bold flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5" /></div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{isAnonymous ? 'Anonymous Student' : displayName ?? 'Student'}</p>
            <p className="text-xs text-gray-400">{level && `${level} · `}{timeAgo(createdAt)}</p>
          </div>
          <Badge variant={genderColors[gender]}>{gender}</Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
          <GraduationCap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="truncate">{university}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="truncate">{preferredArea}, {state}</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
            <Wallet className="w-4 h-4 text-accent" /> {formatCurrency(budget)}<span className="text-xs font-normal text-gray-400">/yr budget</span>
          </div>
          {hasListingDetails && <Badge variant="green">Has a place</Badge>}
        </div>
      </div>
    </Link>
  );
}
