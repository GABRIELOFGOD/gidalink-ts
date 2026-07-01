'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Spinner, Badge } from '@/components/ui/index';
import { Users, Home, CreditCard, Flag, EyeOff, UserSquare2 } from 'lucide-react';
import { formatCurrency, timeAgo } from '@/lib/utils';

interface AnalyticsData {
  stats: {
    users: { total: number; students: number; hostelOwners: number; agents: number };
    listings: { total: number; available: number; premium: number; flagged: number; anonymous: number };
    payments: { total: number; pending: number; volume: number; platformRevenue: number };
    reviews: { total: number };
    roommates: { total: number };
  };
  recentUsers: { _id: string; name: string; email: string; role: string; createdAt: string }[];
  recentListings: { _id: string; title: string; annualRent: number; creator?: { name: string }; isAnonymous: boolean; createdAt: string }[];
}

export default function AdminOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!data) return <div className="text-center py-24 text-gray-400">Failed to load analytics</div>;

  const { stats, recentUsers, recentListings } = data;

  const cards = [
    { icon: Users,      label: 'Total Users',      value: stats.users.total,                sub: `${stats.users.students} students · ${stats.users.hostelOwners} owners · ${stats.users.agents} agents` },
    { icon: Home,       label: 'Total Listings',   value: stats.listings.total,              sub: `${stats.listings.available} available · ${stats.listings.premium} featured` },
    { icon: CreditCard, label: 'Platform Revenue', value: formatCurrency(stats.payments.platformRevenue), sub: `From ${stats.payments.total} successful transactions` },
    { icon: Flag,       label: 'Flagged Listings', value: stats.listings.flagged,            sub: 'Require moderation review' },
    { icon: EyeOff,     label: 'Anonymous Listings', value: stats.listings.anonymous,        sub: 'Identity hidden from public' },
    { icon: UserSquare2, label: 'Roommate Posts',  value: stats.roommates.total,              sub: 'Active roommate requests' },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(({ icon: Icon, label, value, sub }, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-3"><Icon className="w-5 h-5 text-red-500" /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-900 text-sm">Recent Users</h2></div>
          <div className="divide-y divide-gray-50">
            {recentUsers.map(u => (
              <div key={u._id} className="flex items-center justify-between p-4">
                <div><p className="text-sm font-medium text-gray-800">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                <div className="text-right"><Badge variant="gray" className="capitalize">{u.role.replace('_', ' ')}</Badge><p className="text-xs text-gray-400 mt-1">{timeAgo(u.createdAt)}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-900 text-sm">Recent Listings</h2></div>
          <div className="divide-y divide-gray-50">
            {recentListings.map(l => (
              <Link key={l._id} href={`/listings/${l._id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{l.title}</p>
                    {l.isAnonymous && <EyeOff className="w-3 h-3 text-gray-400" />}
                  </div>
                  <p className="text-xs text-gray-400">by {l.isAnonymous ? `${l.creator?.name} (anon. publicly)` : l.creator?.name}</p>
                </div>
                <div className="text-right"><p className="text-sm font-semibold text-gray-700">{formatCurrency(l.annualRent)}</p><p className="text-xs text-gray-400">{timeAgo(l.createdAt)}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
