import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import RoommateRequest from '@/models/RoommateRequest';
import { getAuthUser } from '@/lib/auth';
import { apiSuccess, apiError, omitFields } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const r = await RoommateRequest.findOne({ _id: id, isDeleted: false });
    if (!r) return apiError('Roommate post not found', 404);

    const obj = r.toObject();
    const safe = omitFields(obj, ['deviceId']);
    if (safe.isAnonymous) safe.userId = undefined;

    return apiSuccess({ request: safe });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const auth = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    const r = await RoommateRequest.findOne({ _id: id, isDeleted: false });
    if (!r) return apiError('Roommate post not found', 404);

    const isOwner = (auth && r.userId?.toString() === auth.id) || (deviceId && r.deviceId === deviceId);
    const isAdmin = auth?.role === 'admin';
    if (!isOwner && !isAdmin) return apiError('Forbidden', 403);

    r.isDeleted = true;
    await r.save();
    return apiSuccess({ message: 'Roommate post deleted' });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
