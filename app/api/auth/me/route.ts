import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { error, user: auth } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const user = await User.findById(auth.id);
    if (!user) return apiError('User not found', 404);
    return apiSuccess({ user: user.toPublic() });
  } catch {
    return apiError('Server error', 500);
  }
}
