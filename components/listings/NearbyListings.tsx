'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import CompactListingCard from './CompactListingCard';
import { Spinner } from '@/components/ui/index';
import type { IListing } from '@/types';

interface NearbyListingsProps {
  listingId: string;
}

export default function NearbyListings({ listingId }: NearbyListingsProps) {
  const router = useRouter();
  const [listings, setListings] = useState<IListing[]>([]);
  const [university, setUniversity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const res = await fetch(`/api/listings/${listingId}/nearby?limit=5`);
        const data = await res.json();
        if (data.success) {
          setListings(data.listings ?? []);
          setUniversity(data.university);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [listingId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Nearby Properties
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {university ? `Other properties near ${university}` : 'Other properties in this area'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {listings.map((listing, index) => {
          const isMostRated = index === 0 && listing.averageRating > 0;
          return (
            <CompactListingCard key={listing._id} listing={listing} isMostRated={isMostRated} />
          );
        })}
      </div>

      {university && (
        <button
          onClick={() => router.push(`/listings?nearbyUniversity=${encodeURIComponent(university)}`)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-primary hover:bg-primary-light rounded-lg transition-colors border border-primary-light"
        >
          View More Nearby Properties <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
