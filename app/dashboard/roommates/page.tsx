'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Spinner, Badge } from '@/components/ui/index';
import Button from '@/components/ui/Button';
import { Plus, Users, Trash2, Eye } from 'lucide-react';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { getDeviceId } from '@/lib/deviceId';
import type { IRoommateRequest } from '@/types';
import toast from 'react-hot-toast';

export default function MyRoommatePostsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<IRoommateRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    // Roommate posts can be made while logged out, tied to deviceId, so we ask the
    // server to filter by our userId (if logged in) and/or this browser's deviceId.
    const deviceId = getDeviceId();
    fetch(`/api/roommates?mine=true&deviceId=${deviceId}`).then(r => r.json()).then(d => {
      setRequests(d.requests ?? []);
    }).finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this roommate post?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/roommates/${id}?deviceId=${getDeviceId()}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Post deleted');
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setDeleting(null); }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">My Roommate Posts</h1><p className="text-sm text-gray-500 mt-1">{requests.length} post{requests.length !== 1 && 's'}</p></div>
        <Link href="/roommates/new"><Button variant="accent"><Plus className="w-4 h-4" /> New Post</Button></Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-4">You haven&apos;t posted any roommate requests yet</p>
          <p className="text-xs text-gray-400 mb-4">Note: posts made anonymously or without an account are matched to this browser only.</p>
          <Link href="/roommates/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-dark transition-colors"><Plus className="w-4 h-4" /> Post a Roommate Request</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r._id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{r.university}</p>
                  {r.isAnonymous && <Badge variant="gray">Anonymous</Badge>}
                  {r.hasListingDetails && <Badge variant="green">Has a place</Badge>}
                </div>
                <p className="text-xs text-gray-500">{r.preferredArea}, {r.state} · {formatCurrency(r.budget)}/yr · {timeAgo(r.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/roommates/${r._id}`} className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"><Eye className="w-4 h-4" /></Link>
                <Button size="sm" variant="danger" onClick={() => handleDelete(r._id)} loading={deleting === r._id}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
