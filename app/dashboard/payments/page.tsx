'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Spinner, Badge } from '@/components/ui/index';
import { CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { IPayment } from '@/types';
import toast from 'react-hot-toast';

const statusColors: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = { success: 'green', pending: 'yellow', failed: 'red', refunded: 'gray' };

function PaymentsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const ref = searchParams.get('ref');
    const status = searchParams.get('payment');
    if (ref && status === 'success') {
      fetch(`/api/payments/verify/${ref}`).then(r => r.json()).then(d => { if (d.success) toast.success('Payment verified successfully!'); });
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/payments').then(r => r.json()).then(d => setPayments(d.payments ?? [])).finally(() => setLoading(false));
  }, []);

  if (!user || loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const totalIn  = payments.filter(p => p.recipient?._id === user._id && p.status === 'success').reduce((s, p) => s + p.netAmount, 0);
  const totalOut = payments.filter(p => p.payer?._id === user._id && p.status === 'success').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card"><div className="flex items-center gap-2 text-green-600 mb-2"><ArrowDownLeft className="w-4 h-4" /><span className="text-xs font-semibold uppercase">Received</span></div><p className="text-xl font-bold text-gray-900">{formatCurrency(totalIn)}</p></div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card"><div className="flex items-center gap-2 text-blue-600 mb-2"><ArrowUpRight className="w-4 h-4" /><span className="text-xs font-semibold uppercase">Sent</span></div><p className="text-xl font-bold text-gray-900">{formatCurrency(totalOut)}</p></div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center"><CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No transactions yet</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Description</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => {
                const isReceived = p.recipient?._id === user._id;
                return (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4"><p className="font-medium text-gray-800 truncate max-w-[220px]">{p.description}</p><p className="text-xs text-gray-400">{isReceived ? `From ${p.payer?.name}` : `To ${p.recipient?.name}`}</p></td>
                    <td className="px-5 py-4 capitalize text-gray-500">{p.type}</td>
                    <td className="px-5 py-4 font-semibold"><span className={isReceived ? 'text-green-600' : 'text-gray-700'}>{isReceived ? '+' : '-'}{formatCurrency(isReceived ? p.netAmount : p.amount)}</span></td>
                    <td className="px-5 py-4"><Badge variant={statusColors[p.status]} className="capitalize">{p.status}</Badge></td>
                    <td className="px-5 py-4 text-gray-400">{formatDate(p.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Spinner size="lg" /></div>}>
      <PaymentsContent />
    </Suspense>
  );
}
