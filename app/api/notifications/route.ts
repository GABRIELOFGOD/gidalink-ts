import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    const all   = searchParams.get('all');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { user: user.id };
    if (since && !all) query.createdAt = { $gt: new Date(since) };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user: user.id, isRead: false });

    return apiSuccess({ notifications, unreadCount });
  } catch {
    return apiError('Server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    await Notification.updateMany({ user: user.id, isRead: false }, { isRead: true });
    return apiSuccess({ message: 'All notifications marked as read' });
  } catch {
    return apiError('Server error', 500);
  }
}
