'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import MessageThread from '@/components/messaging/MessageThread';
import { Spinner } from '@/components/ui/index';
import type { IConversation } from '@/types';

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/conversations').then(r => r.json()).then(d => {
      const conv = (d.conversations ?? []).find((c: IConversation) => c._id === id);
      setConversation(conv ?? null);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!conversation) return <div className="text-center py-24 text-gray-400 font-medium">Conversation not found</div>;

  const otherUser = conversation.participants.find(p => p._id !== user?._id);

  return (
    <div className="max-w-2xl h-[calc(100vh-180px)]">
      <MessageThread conversationId={id} otherUser={otherUser} listing={conversation.listing} />
    </div>
  );
}
