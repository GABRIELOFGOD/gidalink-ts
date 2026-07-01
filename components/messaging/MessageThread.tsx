'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, Spinner } from '@/components/ui/index';
import { Send } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { IMessage } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  conversationId: string;
  otherUser?: { _id: string; name: string; profilePhoto?: string };
  listing?: { title: string } | null;
}

export default function MessageThread({ conversationId, otherUser, listing }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const lastMsgTime = useRef<string | null>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);

  const scroll = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchMessages = useCallback(async (initial = false) => {
    try {
      const url = lastMsgTime.current && !initial
        ? `/api/conversations/${conversationId}/messages?since=${lastMsgTime.current}`
        : `/api/conversations/${conversationId}/messages`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages?.length) {
        setMessages((prev: IMessage[]) => {
          if (initial) return data.messages;
          const ids = new Set(prev.map(m => m._id));
          return [...prev, ...data.messages.filter((m: IMessage) => !ids.has(m._id))];
        });
        lastMsgTime.current = data.messages[data.messages.length - 1]?.createdAt;
        setTimeout(scroll, 50);
      }
    } catch {} finally { if (initial) setLoading(false); }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages(true);
    const iv = setInterval(() => fetchMessages(false), 3000);
    return () => clearInterval(iv);
  }, [fetchMessages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessages(prev => [...prev, data.message]);
      setInput('');
      lastMsgTime.current = data.message.createdAt;
      setTimeout(scroll, 50);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to send'); } finally { setSending(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white">
        <Avatar src={otherUser?.profilePhoto} name={otherUser?.name ?? '?'} size="md" />
        <div>
          <p className="font-semibold text-gray-900 text-sm">{otherUser?.name}</p>
          {listing && <p className="text-xs text-gray-400 truncate max-w-xs">Re: {listing.title}</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0" style={{ maxHeight: '420px' }}>
        {messages.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No messages yet. Say hello!</p>}
        {messages.map(msg => {
          const mine = msg.sender?._id === user?._id;
          return (
            <div key={msg._id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
              {!mine && <Avatar src={msg.sender?.profilePhoto} name={msg.sender?.name ?? '?'} size="sm" className="flex-shrink-0 mt-auto" />}
              <div className={`max-w-[70%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${mine ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>{msg.content}</div>
                <p className="text-xs text-gray-400 px-1">{timeAgo(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 items-center">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="Type a message…" className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
        <button onClick={send} disabled={!input.trim() || sending} className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
