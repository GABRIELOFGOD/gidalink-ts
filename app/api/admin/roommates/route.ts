import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import RoommateRequest from '@/models/RoommateRequest';
import { requireAdmin } from '@/lib/auth';
import { apiSuccess, apiError, paginate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const { skip, limit } = paginate(page, 20);

    // Admins see the real userId behind anonymous posts for moderation purposes
    const [requests, total] = await Promise.all([
      RoommateRequest.find({ isDeleted: false }).populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      RoommateRequest.countDocuments({ isDeleted: false }),
    ]);

    return apiSuccess({ requests, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch {
    return apiError('Server error', 500);
  }
}
