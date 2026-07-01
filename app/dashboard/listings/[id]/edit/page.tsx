'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import ListingForm from '@/components/listings/ListingForm';
import { Spinner } from '@/components/ui/index';
import type { IListing } from '@/types';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<IListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user) return;
    fetch(`/api/listings/${id}`)
      .then(r => r.json())
      .then(d => {
        if (!d.success) { setError('Listing not found'); return; }
        if (d.listing.creator?._id !== user._id) { setError('You do not have permission to edit this listing'); return; }
        setListing(d.listing);
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center py-24 text-red-500 font-medium">{error}</div>;

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1><p className="text-sm text-gray-500 mt-1">Update the details of your listing.</p></div>
      <ListingForm initialData={listing} listingId={id} />
    </div>
  );
}
