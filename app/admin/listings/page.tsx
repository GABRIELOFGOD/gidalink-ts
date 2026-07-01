'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge, Spinner } from '@/components/ui/index';
import Button from '@/components/ui/Button';
import { Search, Eye, EyeOff } from 'lucide-react';
import { formatCurrency, timeAgo } from '@/lib/utils';
import type { IListing } from '@/types';
import toast from 'react-hot-toast';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<IListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/listings?${params}`);
    const data = await res.json();
    setListings(data.listings ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this listing?')) return;
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDeleted: true }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Listing removed');
      fetchListings();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Listings Management</h1>
      <p className="text-xs text-gray-400 mb-5">Admins can see the real account behind anonymous listings for moderation purposes only. This is never shown to regular users.</p>

      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchListings()} placeholder="Search by title or area..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
        </div>
        <Button onClick={fetchListings}>Search</Button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Listing</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Real Owner</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Price</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Posted</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listings.map(l => (
                <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5"><p className="font-medium text-gray-800 truncate max-w-[200px]">{l.title}</p>{l.isAnonymous && <EyeOff className="w-3.5 h-3.5 text-gray-400" />}</div>
                    <p className="text-xs text-gray-400">{l.area}, {l.lga}</p>
                  </td>
                  <td className="px-5 py-4"><p className="text-gray-700">{l.creator?.name}</p><Badge variant="gray" className="capitalize mt-0.5">{l.creator?.role.replace('_', ' ')}</Badge></td>
                  <td className="px-5 py-4 font-semibold text-gray-700">{formatCurrency(l.annualRent)}</td>
                  <td className="px-5 py-4 text-gray-400">{timeAgo(l.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/listings/${l._id}`} className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"><Eye className="w-4 h-4" /></Link>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(l._id)}>Remove</Button>
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
