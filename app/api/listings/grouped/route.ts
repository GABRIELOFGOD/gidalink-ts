import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';
import { apiSuccess, apiError, paginate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const cardsPerUniversity = parseInt(searchParams.get('cardsPerUniversity') ?? '10');

    // Find all listings grouped by university
    const query = { isDeleted: false };
    const listings = await Listing.find(query)
      .populate('creator', 'name profilePhoto role phone showPhone')
      .sort({ isPremium: -1, createdAt: -1 });

    const now = new Date();

    // Group listings by university
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupedByUniversity: Record<string, any[]> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unlistedProperties: any[] = [];

    listings.forEach((l) => {
      const obj = l.toObject() as ReturnType<typeof l.toObject> & { isPremium: boolean; monthlyRent: number };
      obj.isPremium = l.isPremium && l.premiumExpiry !== null && l.premiumExpiry > now;
      obj.monthlyRent = Math.round(obj.annualRent / 12);

      // Strip identity if anonymous
      if (obj.isAnonymous) obj.creator = null;

      const university = obj.nearbyUniversity?.trim();

      if (!university || university === '') {
        unlistedProperties.push(obj);
      } else {
        if (!groupedByUniversity[university]) {
          groupedByUniversity[university] = [];
        }
        groupedByUniversity[university].push(obj);
      }
    });

    // Limit listings per university and sort by rating
    Object.keys(groupedByUniversity).forEach((university) => {
      groupedByUniversity[university] = groupedByUniversity[university]
        .sort((a, b) => b.averageRating - a.averageRating) // Sort by rating descending
        .slice(0, cardsPerUniversity);
    });

    // Paginate universities
    const universityNames = Object.keys(groupedByUniversity).sort();
    const totalUniversities = universityNames.length;
    const { skip } = paginate(page, limit);
    const paginatedUniversities = universityNames.slice(skip, skip + limit);

    // Build response
    const groupedData = paginatedUniversities.map((university) => ({
      name: university,
      count: groupedByUniversity[university].length,
      listings: groupedByUniversity[university],
    }));

    // Limit unlisted properties to cardsPerUniversity as well, sorted by rating
    const limitedUnlistedProperties = unlistedProperties
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, cardsPerUniversity);

    return apiSuccess({
      universities: groupedData,
      unlistedProperties: limitedUnlistedProperties,
      pagination: {
        page,
        limit,
        total: totalUniversities,
        pages: Math.ceil(totalUniversities / limit),
      },
    });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
