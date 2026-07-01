import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import Listing from '@/models/Listing';
import User from '@/models/User';
import { getAuthUser, createNotification } from '@/lib/auth';
import { apiSuccess, apiError, omitFields } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const reviewsRaw = await Review.find({ listing: id, isDeleted: false }).sort({ createdAt: -1 });

    // Resolve display name/photo for non-anonymous reviews
    const reviews = await Promise.all(
      reviewsRaw.map(async r => {
        const obj = r.toObject();
        if (!obj.isAnonymous && obj.userId) {
          const u = await User.findById(obj.userId).select('name profilePhoto');
          obj.displayName = u?.name ?? 'Student';
          obj.displayPhoto = u?.profilePhoto ?? '';
        }
        // Never expose device IDs or raw userId to the client
        return omitFields(obj, ['deviceId', 'userId']);
      })
    );

    return apiSuccess({ reviews });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const auth = await getAuthUser(request);

    const { overallRating, ratings, writtenReview, moveInDate, moveOutDate, isAnonymous, deviceId } = await request.json();

    if (!deviceId) return apiError('Device identifier missing — please refresh and try again');
    if (!overallRating || overallRating < 1 || overallRating > 5) return apiError('Overall rating (1–5) is required');
    if (!writtenReview || writtenReview.trim().length < 30) return apiError('Review must be at least 30 characters');

    const listing = await Listing.findOne({ _id: id, isDeleted: false });
    if (!listing) return apiError('Listing not found', 404);

    const existing = await Review.findOne({ listing: id, deviceId });
    if (existing) return apiError('You have already reviewed this listing from this device');

    let displayName: string | undefined;
    let displayPhoto: string | undefined;
    if (!isAnonymous && auth) {
      const u = await User.findById(auth.id).select('name profilePhoto');
      displayName = u?.name;
      displayPhoto = u?.profilePhoto;
    }

    const review = await Review.create({
      listing: id, userId: auth?.id ?? undefined, deviceId, isAnonymous: !!isAnonymous,
      displayName: displayName ?? '', displayPhoto: displayPhoto ?? '',
      overallRating, ratings: ratings || {}, writtenReview: writtenReview.trim(),
      moveInDate: moveInDate || '', moveOutDate: moveOutDate || '',
    });

    const allReviews = await Review.find({ listing: id, isDeleted: false });
    const avg = allReviews.reduce((s, r) => s + r.overallRating, 0) / allReviews.length;
    await Listing.findByIdAndUpdate(id, { averageRating: Math.round(avg * 10) / 10, reviewCount: allReviews.length });

    await createNotification(listing.creator.toString(), {
      type: 'review', title: 'New Review',
      message: `Someone left a review on your listing "${listing.title}"`,
      link: `/listings/${id}`,
    });

    const obj = review.toObject();
    const safeReview = omitFields(obj, ['deviceId', 'userId']);

    return apiSuccess({ message: 'Review posted', review: safeReview }, 201);
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
