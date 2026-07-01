import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';
import { requireAdmin } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    const { isFlagged, isDeleted, flags } = await request.json();
    const listing = await Listing.findById(id);
    if (!listing) return apiError('Listing not found', 404);

    if (isFlagged !== undefined) listing.isFlagged = isFlagged;
    if (isDeleted !== undefined) listing.isDeleted = isDeleted;
    if (flags !== undefined) listing.flags = flags;
    await listing.save();

    return apiSuccess({ message: 'Listing updated', listing });
  } catch {
    return apiError('Server error', 500);
  }
}
