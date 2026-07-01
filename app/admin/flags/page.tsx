'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge, Spinner } from '@/components/ui/index';
import Button from '@/components/ui/Button';
import { Flag, Eye } from 'lucide-react';
import { formatCurrency, timeAgo } from '@/lib/utils';
import type { IListing } from '@/types';
import toast from 'react-hot-toast';

export default function AdminFlagsPage() {
  const [listings, setListings] = useState<IListing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlagged = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/listings?flagged=true');
    const data = await res.json();
    setListings(data.listings ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchFlagged(); }, []);

  const handleAction = async (id: string, action: 'remove' | 'clear') => {
    try {
      const body = action === 'remove' ? { isDeleted: true } : { isFlagged: false, flags: [] };
      const res = await fetch(`/api/admin/listings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(action === 'remove' ? 'Listing removed' : 'Flags cleared');
      fetchFlagged();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Flagged Content</h1>

      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center"><Flag className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No flagged listings. All clear!</p></div>
      ) : (
        <div className="space-y-4">
          {listings.map(l => (
            <div key={l._id} className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1"><Badge variant="red">{l.flagCount} report{l.flagCount !== 1 && 's'}</Badge><span className="text-xs text-gray-400">{timeAgo(l.createdAt)}</span></div>
                  <p className="font-semibold text-gray-900">{l.title}</p>
                  <p className="text-xs text-gray-400">by {l.creator?.name} ({l.creator?.role.replace('_', ' ')}) · {formatCurrency(l.annualRent)}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/listings/${l._id}`}><Button size="sm" variant="secondary"><Eye className="w-3.5 h-3.5" /> View</Button></Link>
                  <Button size="sm" variant="outline" onClick={() => handleAction(l._id, 'clear')}>Clear Flags</Button>
                  <Button size="sm" variant="danger" onClick={() => handleAction(l._id, 'remove')}>Remove Listing</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
