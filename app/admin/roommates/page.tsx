'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge, Spinner } from '@/components/ui/index';
import { Eye } from 'lucide-react';
import { formatCurrency, timeAgo } from '@/lib/utils';
import type { IRoommateRequest } from '@/types';

export default function AdminRoommatesPage() {
  const [requests, setRequests] = useState<(IRoommateRequest & { userId?: { name: string; email: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/roommates').then(r => r.json()).then(d => setRequests(d.requests ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Roommate Posts</h1>
      <p className="text-xs text-gray-400 mb-6">Admins can see the real account behind anonymous posts for moderation purposes only.</p>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center"><p className="text-gray-500 font-medium">No roommate posts yet</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">University</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Real Account</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Budget</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Posted</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map(r => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4"><p className="font-medium text-gray-800 truncate max-w-[200px]">{r.university}</p><p className="text-xs text-gray-400">{r.preferredArea}, {r.state}</p></td>
                  <td className="px-5 py-4">{r.userId ? <p className="text-gray-700">{r.userId.name}</p> : <Badge variant="gray">No Account (Device Only)</Badge>}</td>
                  <td className="px-5 py-4 font-semibold text-gray-700">{formatCurrency(r.budget)}/yr</td>
                  <td className="px-5 py-4 text-gray-400">{timeAgo(r.createdAt)}</td>
                  <td className="px-5 py-4 text-right"><Link href={`/roommates/${r._id}`} className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors inline-block"><Eye className="w-4 h-4" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
