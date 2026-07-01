import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    const { reason } = await request.json();
    const listing = await Listing.findOne({ _id: id, isDeleted: false });
    if (!listing) return apiError('Listing not found', 404);

    const already = listing.flags.some(f => f.user.toString() === user.id);
    if (already) return apiError('You have already flagged this listing');

    listing.flags.push({ user: new (await import('mongoose')).Types.ObjectId(user.id), reason: reason || 'Inappropriate content', createdAt: new Date() });
    listing.flagCount = listing.flags.length;
    if (listing.flagCount >= 3) listing.isFlagged = true;
    await listing.save();

    return apiSuccess({ message: 'Listing reported. Our team will review it.' });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
