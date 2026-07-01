import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { apiSuccess, apiError, paginate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get('page') ?? '1');
    const search = searchParams.get('search') ?? '';
    const role   = searchParams.get('role') ?? '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role)   query.role = role;

    const { skip, limit } = paginate(page, 20);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);
    return apiSuccess({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch {
    return apiError('Server error', 500);
  }
}
