'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RoommateCard from '@/components/roommates/RoommateCard';
import { Spinner } from '@/components/ui/index';
import Button from '@/components/ui/Button';
import { Plus, Users } from 'lucide-react';
import { UNIVERSITIES, NIGERIAN_STATES } from '@/lib/utils';
import type { IRoommateRequest, PaginationMeta } from '@/types';

export default function RoommatesPage() {
  const [requests, setRequests] = useState<IRoommateRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [university, setUniversity] = useState('');
  const [state, setState]       = useState('');
  const [gender, setGender]     = useState('');
  const [pagination, setPag]    = useState<PaginationMeta>({ page: 1, limit: 12, pages: 1, total: 0 });
  const [page, setPage]         = useState(1);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (university) params.set('university', university);
      if (state) params.set('state', state);
      if (gender) params.set('gender', gender);
      const res = await fetch(`/api/roommates?${params}`);
      const data = await res.json();
      if (data.success) { setRequests(data.requests); setPag(data.pagination); }
    } catch {} finally { setLoading(false); }
  }, [page, university, state, gender]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />

      <div className="bg-gradient-to-br from-accent to-accent-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4"><Users className="w-4 h-4" /> Roommate Board</div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Find a Roommate to Split Rent With</h1>
          <p className="text-white/85 max-w-xl mx-auto mb-6">Browse students looking to share housing costs near your campus, or post your own request.</p>
          <Link href="/roommates/new"><Button variant="secondary" size="lg" className="bg-white text-accent-dark hover:bg-gray-50"><Plus className="w-4 h-4" /> Post a Roommate Request</Button></Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          <select value={university} onChange={e => { setUniversity(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-primary">
            <option value="">All Universities</option>
            {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select value={state} onChange={e => { setState(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-primary">
            <option value="">All States</option>
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={gender} onChange={e => { setGender(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-primary">
            <option value="">Any Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-4">🤝</p><p className="font-semibold text-gray-600">No roommate posts yet</p><p className="text-sm mt-1">Be the first to post one</p></div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5"><span className="font-semibold text-gray-900">{pagination.total}</span> students looking for roommates</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {requests.map(r => <RoommateCard key={r._id} request={r} />)}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
