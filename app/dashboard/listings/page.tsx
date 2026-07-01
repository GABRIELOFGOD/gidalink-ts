'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Spinner, Badge } from '@/components/ui/index';
import Button from '@/components/ui/Button';
import { Plus, Edit2, Trash2, Eye, Crown, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { IListing } from '@/types';
import toast from 'react-hot-toast';

const statusColors: Record<string, 'green' | 'red' | 'yellow'> = { Available: 'green', Taken: 'red', 'Available Soon': 'yellow' };

export default function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<IListing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    const res = await fetch('/api/listings?limit=100&mine=true');
    const data = await res.json();
    setListings(data.listings ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchListings(); }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Listing deleted');
      setListings(prev => prev.filter(l => l._id !== id));
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setDeleting(null); }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">My Listings</h1><p className="text-sm text-gray-500 mt-1">{listings.length} listing{listings.length !== 1 && 's'} posted</p></div>
        <Link href="/dashboard/listings/new"><Button><Plus className="w-4 h-4" /> New Listing</Button></Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center"><p className="text-gray-500 font-medium">No listings yet</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Listing</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Price</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Views</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listings.map(l => (
                <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/listings/${l._id}`} className="flex items-center gap-3 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.photos?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate max-w-[200px] group-hover:text-primary transition-colors">{l.title}</p>
                        <p className="text-xs text-gray-400">{l.area}, {l.lga}</p>
                      </div>
                      {l.isPremium && <Crown className="w-4 h-4 text-accent flex-shrink-0" />}
                      {l.isAnonymous && <EyeOff className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                    </Link>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-700">{formatCurrency(l.annualRent)}</td>
                  <td className="px-5 py-4"><Badge variant={statusColors[l.availabilityStatus]}>{l.availabilityStatus}</Badge></td>
                  <td className="px-5 py-4 text-gray-500"><span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {l.views}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/listings/${l._id}/edit`} className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></Link>
                      <button onClick={() => handleDelete(l._id)} disabled={deleting === l._id} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
