'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, Spinner } from '@/components/ui/index';
import { MessageCircle } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { IConversation } from '@/types';

export default function MessagesListPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/conversations').then(r => r.json()).then(d => setConversations(d.conversations ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center"><MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No conversations yet</p><p className="text-sm text-gray-400 mt-1">Messages from listing inquiries will appear here</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card divide-y divide-gray-50 overflow-hidden">
          {conversations.map(c => {
            const other = c.participants.find(p => p._id !== user?._id);
            return (
              <Link key={c._id} href={`/dashboard/messages/${c._id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <Avatar src={other?.profilePhoto} name={other?.name ?? '?'} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><p className="font-semibold text-gray-900 text-sm">{other?.name}</p><p className="text-xs text-gray-400">{timeAgo(c.lastMessageAt)}</p></div>
                  {c.listing && <p className="text-xs text-primary truncate">Re: {c.listing.title}</p>}
                  <p className="text-sm text-gray-500 truncate mt-0.5">{c.lastMessage || 'Start the conversation'}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
