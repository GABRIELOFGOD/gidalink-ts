import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Conversation, Message } from '@/models/Conversation';
import { requireAuth, createNotification } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    const conversation = await Conversation.findOne({ _id: id, participants: user.id });
    if (!conversation) return apiError('Conversation not found', 404);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { conversation: id };
    if (since) query.createdAt = { $gt: new Date(since) };

    const messages = await Message.find(query).populate('sender', 'name profilePhoto role').sort({ createdAt: 1 }).limit(since ? 50 : 100);

    await Message.updateMany({ conversation: id, sender: { $ne: user.id }, isRead: false }, { isRead: true });

    return apiSuccess({ messages });
  } catch {
    return apiError('Server error', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    const { content } = await request.json();
    if (!content?.trim()) return apiError('Message cannot be empty');

    const conversation = await Conversation.findOne({ _id: id, participants: user.id });
    if (!conversation) return apiError('Conversation not found', 404);

    const message = await Message.create({ conversation: id, sender: user.id, content: content.trim() });

    conversation.lastMessage = content.trim().slice(0, 80);
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const otherId = conversation.participants.find(p => p.toString() !== user.id);
    if (otherId) {
      await createNotification(otherId.toString(), {
        type: 'message', title: 'New Message', message: `${user.name}: ${content.slice(0, 60)}`,
        link: `/dashboard/messages/${id}`,
      });
    }

    await message.populate('sender', 'name profilePhoto role');
    return apiSuccess({ message }, 201);
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
