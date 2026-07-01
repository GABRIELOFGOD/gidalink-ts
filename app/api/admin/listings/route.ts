import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';
import { requireAdmin } from '@/lib/auth';
import { apiSuccess, apiError, paginate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page    = parseInt(searchParams.get('page') ?? '1');
    const flagged = searchParams.get('flagged') === 'true';
    const search  = searchParams.get('search') ?? '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (flagged) query.isFlagged = true;
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { area: { $regex: search, $options: 'i' } }];

    const { skip, limit } = paginate(page, 20);
    // Admins always see the real creator, even on anonymous listings — this is intentional
    // for moderation purposes and is never surfaced to regular users.
    const [listings, total] = await Promise.all([
      Listing.find(query).populate('creator', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Listing.countDocuments(query),
    ]);
    return apiSuccess({ listings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch {
    return apiError('Server error', 500);
  }
}
