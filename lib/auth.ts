import { NextRequest } from 'next/server';
import { verifyJWT, getTokenFromRequest, type AuthPayload } from '@/lib/jwt';
import { connectDB } from '@/lib/db';
import { apiError } from '@/lib/utils';

export async function getAuthUser(request: NextRequest): Promise<AuthPayload | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyJWT(token);
}

export async function requireAuth(
  request: NextRequest
): Promise<{ error: Response; user: null } | { error: null; user: AuthPayload }> {
  const user = await getAuthUser(request);
  if (!user) return { error: apiError('Unauthorized', 401), user: null };
  return { error: null, user };
}

export async function requireAdmin(
  request: NextRequest
): Promise<{ error: Response; user: null } | { error: null; user: AuthPayload }> {
  const user = await getAuthUser(request);
  if (!user)               return { error: apiError('Unauthorized', 401), user: null };
  if (user.role !== 'admin') return { error: apiError('Forbidden — admin only', 403), user: null };
  return { error: null, user };
}

export async function createNotification(
  userId: string,
  payload: { type: string; title: string; message: string; link?: string }
): Promise<void> {
  try {
    await connectDB();
    const Notification = (await import('@/models/Notification')).default;
    await Notification.create({ user: userId, ...payload });
  } catch (e) {
    console.error('Notification error:', e);
  }
}
