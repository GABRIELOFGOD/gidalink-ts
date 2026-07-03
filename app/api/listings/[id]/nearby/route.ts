import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '5');

    // Get the current listing
    const currentListing = await Listing.findOne({ _id: id, isDeleted: false });
    if (!currentListing) return apiError('Listing not found', 404);

    // Build query for nearby listings
    const query: Record<string, unknown> = {
      _id: { $ne: id },
      isDeleted: false
    };

    // First, try to find listings by the same university
    if (currentListing.nearbyUniversity) {
      query.nearbyUniversity = currentListing.nearbyUniversity;
    } else {
      // If no university, use the same area
      query.area = currentListing.area;
    }

    const nearbyListings = await Listing.find(query)
      .populate('creator', 'name profilePhoto role phone showPhone')
      .sort({ averageRating: -1, isPremium: -1, createdAt: -1 })
      .limit(limit);

    const now = new Date();
    const listings = nearbyListings.map((l) => {
      const obj = l.toObject() as ReturnType<typeof l.toObject> & { isPremium: boolean; monthlyRent: number };
      obj.isPremium = l.isPremium && l.premiumExpiry !== null && l.premiumExpiry > now;
      obj.monthlyRent = Math.round(obj.annualRent / 12);

      // Strip identity if anonymous
      if (obj.isAnonymous) obj.creator = null;

      return obj;
    });

    return apiSuccess({ listings, university: currentListing.nearbyUniversity });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
