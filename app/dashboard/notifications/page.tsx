'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/index';
import Button from '@/components/ui/Button';
import { Bell, MessageCircle, CreditCard, Star, AlertTriangle, CheckCheck } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { INotification } from '@/types';

const iconMap: Record<string, React.ElementType> = { message: MessageCircle, payment: CreditCard, review: Star, flag: AlertTriangle, default: Bell };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchAll = () => fetch('/api/notifications?all=true').then(r => r.json()).then(d => setNotifications(d.notifications ?? [])).finally(() => setLoading(false));

  useEffect(() => { fetchAll(); }, []);

  const markAllRead = async () => { setMarking(true); await fetch('/api/notifications', { method: 'PUT' }); await fetchAll(); setMarking(false); };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <Button variant="secondary" size="sm" onClick={markAllRead} loading={marking}><CheckCheck className="w-4 h-4" /> Mark all read</Button>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center"><Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No notifications yet</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card divide-y divide-gray-50 overflow-hidden">
          {notifications.map(n => {
            const Icon = iconMap[n.type] ?? iconMap.default;
            return (
              <Link key={n._id} href={n.link || '#'} className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-primary-light/30' : ''}`}>
                <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900">{n.title}</p><p className="text-sm text-gray-500 mt-0.5">{n.message}</p><p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p></div>
                {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
