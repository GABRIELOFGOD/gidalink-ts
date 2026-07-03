'use client';
import Link from 'next/link';
import { MapPin, Droplets, Zap, Star, Crown } from 'lucide-react';
import { Badge, Avatar } from '@/components/ui/index';
import AnonymousAvatar from '@/components/ui/AnonymousAvatar';
import BookmarkButton from './BookmarkButton';
import { formatCurrency } from '@/lib/utils';
import type { IListing } from '@/types';

const statusColors: Record<string, 'green' | 'red' | 'yellow'> = { Available: 'green', Taken: 'red', 'Available Soon': 'yellow' };

interface CompactListingCardProps {
  listing: IListing;
  isMostRated?: boolean;
}

export default function CompactListingCard({ listing, isMostRated = false }: CompactListingCardProps) {
  const {
    _id, title, area, lga, annualRent, monthlyRent, photos, availabilityStatus,
    waterSupply, powerSupply, creator, isAnonymous, averageRating, reviewCount, isPremium, premiumExpiry,
  } = listing;

  const isBoostActive = isPremium && premiumExpiry && new Date() < new Date(premiumExpiry);
  const photo = photos?.[0] ?? null;

  return (
    <div className="group relative">
      <Link href={`/listings/${_id}`} className="block">
        <div className={`bg-white rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${isBoostActive ? 'border-accent/40 shadow-md hover:shadow-lg' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
          <div className="relative h-32 bg-gray-100 overflow-hidden">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-light"><span className="text-2xl">🏠</span></div>
            )}

            <div className="absolute top-2 left-2 flex gap-1">
              {isBoostActive && <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-accent text-white text-[10px] font-bold rounded-full shadow"><Crown className="w-2.5 h-2.5" /></span>}
              {isMostRated && <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow"><Star className="w-2.5 h-2.5 fill-current" /> Most Rated</span>}
              <Badge variant={statusColors[availabilityStatus]} className="text-[10px]">{availabilityStatus}</Badge>
            </div>

            <div className="absolute top-2 right-2 flex items-center gap-2 pointer-events-auto">
              {averageRating > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur rounded-lg text-[10px] font-semibold text-gray-800 shadow">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">({reviewCount})</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3">
            <h3 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors mb-1">{title}</h3>

            <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
              <MapPin className="w-2.5 h-2.5 text-primary flex-shrink-0" />
              <span className="truncate">{area}, {lga}</span>
            </div>

            <div className="flex gap-1 mb-2 flex-wrap">
              {waterSupply?.length > 0 && <div className="flex items-center gap-0.5 text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full"><Droplets className="w-2 h-2" /></div>}
              {powerSupply?.length > 0 && <div className="flex items-center gap-0.5 text-[9px] text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-full"><Zap className="w-2 h-2" /></div>}
            </div>

            <div className="flex items-end justify-between pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-900">{formatCurrency(annualRent)}</p>
                <p className="text-[9px] text-gray-400">{formatCurrency(monthlyRent ?? Math.round(annualRent / 12))}/mo</p>
              </div>
              {isAnonymous ? (
                <AnonymousAvatar seed={_id} size="sm" />
              ) : (
                <Avatar src={creator?.profilePhoto} name={creator?.name ?? '?'} size="sm" />
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Bookmark button - positioned outside the Link to prevent navigation on click */}
      <div className="absolute top-[10px] right-[10px] p-1.5 bg-white/95 backdrop-blur rounded-lg shadow hover:bg-white transition-colors pointer-events-auto">
        <BookmarkButton listingId={_id} size="sm" />
      </div>
    </div>
  );
}
