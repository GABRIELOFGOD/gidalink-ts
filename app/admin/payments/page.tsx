'use client';
import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/index';
import { formatCurrency } from '@/lib/utils';

interface AnalyticsData {
  stats: { payments: { total: number; pending: number; volume: number; platformRevenue: number } };
}

export default function AdminPaymentsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!data) return null;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transactions Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"><p className="text-xs font-semibold text-gray-500 uppercase">Total Volume</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.stats.payments.volume)}</p></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"><p className="text-xs font-semibold text-gray-500 uppercase">Platform Revenue (10%)</p><p className="text-2xl font-bold text-primary mt-1">{formatCurrency(data.stats.payments.platformRevenue)}</p></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"><p className="text-xs font-semibold text-gray-500 uppercase">Successful Transactions</p><p className="text-2xl font-bold text-gray-900 mt-1">{data.stats.payments.total}</p></div>
      </div>

      <div className="bg-primary-light border border-primary/20 rounded-2xl p-5">
        <p className="text-sm text-primary-dark">Note: detailed per-transaction logs are visible to each user under their own Dashboard → Payments. This overview reflects platform-wide totals only.</p>
      </div>
    </div>
  );
}
