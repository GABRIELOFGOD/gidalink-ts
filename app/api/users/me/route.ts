import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const u = await User.findById(user.id);
    if (!u) return apiError('Not found', 404);
    return apiSuccess({ user: u.toPublic() });
  } catch {
    return apiError('Server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { name, phone, bio, university, showPhone, profilePhoto } = await request.json();
    const u = await User.findById(user.id);
    if (!u) return apiError('Not found', 404);

    if (name)             u.name = name.trim();
    if (phone)            u.phone = phone.trim();
    if (bio !== undefined) u.bio = bio.trim();
    if (university !== undefined) u.university = university.trim();
    if (showPhone !== undefined) u.showPhone = showPhone;
    if (profilePhoto)    u.profilePhoto = profilePhoto;
    await u.save();

    return apiSuccess({ message: 'Profile updated', user: u.toPublic() });
  } catch {
    return apiError('Server error', 500);
  }
}
