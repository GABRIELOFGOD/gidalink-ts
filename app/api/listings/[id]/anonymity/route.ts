import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    const { isAnonymous } = await request.json();

    const listing = await Listing.findOne({ _id: id, isDeleted: false });
    if (!listing) return apiError('Listing not found', 404);
    if (listing.creator.toString() !== user.id) return apiError('Forbidden', 403);

    listing.isAnonymous = !!isAnonymous;
    await listing.save();

    return apiSuccess({ message: isAnonymous ? 'Listing is now anonymous' : 'Your identity is now visible on this listing', isAnonymous: listing.isAnonymous });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
