'use client';
import Link from 'next/link';
import { MapPin, Droplets, Zap, Star, Crown, GraduationCap } from 'lucide-react';
import { Badge, Avatar } from '@/components/ui/index';
import AnonymousAvatar from '@/components/ui/AnonymousAvatar';
import { formatCurrency } from '@/lib/utils';
import type { IListing } from '@/types';

const roleColors: Record<string, 'blue' | 'green' | 'orange'> = { student: 'blue', hostel_owner: 'green', agent: 'orange' };
const conditionColors: Record<string, 'red' | 'yellow' | 'green'> = { Poor: 'red', Fair: 'yellow', Good: 'green', Excellent: 'green' };
const statusColors: Record<string, 'green' | 'red' | 'yellow'> = { Available: 'green', Taken: 'red', 'Available Soon': 'yellow' };

export default function ListingCard({ listing }: { listing: IListing }) {
  const {
    _id, title, area, lga, state, annualRent, monthlyRent, photos, availabilityStatus,
    waterSupply, powerSupply, buildingCondition, creator, isAnonymous,
    averageRating, reviewCount, isPremium, premiumExpiry, nearbyUniversity, roomType,
  } = listing;

  const isBoostActive = isPremium && premiumExpiry && new Date() < new Date(premiumExpiry);
  const photo = photos?.[0] ?? null;

  return (
    <Link href={`/listings/${_id}`} className="group block">
      <div className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${isBoostActive ? 'border-accent/40 shadow-md hover:shadow-lg' : 'border-gray-100 shadow-card hover:shadow-card-hover'}`}>
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-light"><span className="text-4xl">🏠</span></div>
          )}

          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {isBoostActive && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-accent text-white text-xs font-bold rounded-full shadow"><Crown className="w-3 h-3" /> Featured</span>
            )}
            <Badge variant={statusColors[availabilityStatus]}>{availabilityStatus}</Badge>
          </div>

          {averageRating > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-gray-800 shadow">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {averageRating.toFixed(1)} ({reviewCount})
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2">
            {nearbyUniversity && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-md mb-1.5">
                <GraduationCap className="w-3 h-3" /> {nearbyUniversity.split('(')[0].trim()}
              </span>
            )}
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="truncate">{area}, {lga}, {state}</span>
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            {roomType && <Badge variant="indigo" className="text-xs">{roomType}</Badge>}
            {waterSupply?.length > 0 && <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><Droplets className="w-3 h-3" />{waterSupply[0]}</div>}
            {powerSupply?.length > 0 && <div className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full"><Zap className="w-3 h-3" />{powerSupply[0]}</div>}
            {buildingCondition && <Badge variant={conditionColors[buildingCondition]} className="text-xs">{buildingCondition}</Badge>}
          </div>

          <div className="flex items-end justify-between pt-3 border-t border-gray-100">
            <div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(annualRent)}</p>
              <p className="text-xs text-gray-400">/year · {formatCurrency(monthlyRent ?? Math.round(annualRent / 12))}/mo</p>
            </div>
            <div className="flex items-center gap-1.5">
              {isAnonymous ? (
                <AnonymousAvatar seed={_id} size="sm" />
              ) : (
                <Avatar src={creator?.profilePhoto} name={creator?.name ?? '?'} size="sm" />
              )}
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-gray-700 truncate max-w-[80px]">{isAnonymous ? 'Anonymous' : creator?.name}</p>
                {!isAnonymous && creator && <Badge variant={roleColors[creator.role] ?? 'gray'} className="capitalize">{creator.role.replace('_', ' ')}</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
