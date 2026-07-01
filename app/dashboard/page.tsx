'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Spinner } from '@/components/ui/index';
import ListingCard from '@/components/listings/ListingCard';
import { Home, CreditCard, Star, Plus, ArrowRight, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { IListing, IPayment } from '@/types';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [listings, setListings] = useState<IListing[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/listings?limit=50&mine=true').then(r => r.json()),
      fetch('/api/payments').then(r => r.json()),
    ]).then(([lData, pData]) => {
      setListings(lData.listings ?? []);
      setPayments(pData.payments ?? []);
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user || loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const totalEarned = payments.filter(p => p.recipient?._id === user._id && p.status === 'success').reduce((s, p) => s + p.netAmount, 0);
  const totalSpent  = payments.filter(p => p.payer?._id === user._id && p.status === 'success').reduce((s, p) => s + p.amount, 0);
  const stats = [
    { icon: Home,       label: 'My Listings', value: String(listings.length) },
    { icon: CreditCard, label: 'Earned',      value: formatCurrency(totalEarned) },
    { icon: CreditCard, label: 'Spent',       value: formatCurrency(totalSpent) },
    { icon: Star,       label: 'Avg. Rating', value: listings.length ? (listings.reduce((s, l) => s + l.averageRating, 0) / listings.length).toFixed(1) : '—' },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening with your GidaLink account.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value }, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center mb-3"><Icon className="w-5 h-5 text-primary" /></div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-accent-light rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-white" /></div>
          <div><p className="font-bold text-gray-900 text-sm">Looking for a roommate?</p><p className="text-xs text-gray-600">Post a request and split your rent with another student.</p></div>
        </div>
        <Link href="/roommates/new" className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-dark transition-colors whitespace-nowrap">Post Request</Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">My Listings</h2>
          <Link href="/dashboard/listings" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-4">You haven&apos;t posted any listings yet</p>
            <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"><Plus className="w-4 h-4" /> Post Your First Listing</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{listings.slice(0, 6).map(l => <ListingCard key={l._id} listing={l} />)}</div>
        )}
      </div>
    </div>
  );
}
