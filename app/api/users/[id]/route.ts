import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Listing from '@/models/Listing';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await User.findById(id);
    if (!user) return apiError('User not found', 404);

    const listings = await Listing.find({ creator: id, isDeleted: false, isAnonymous: false })
      .select('title apartmentType annualRent photos availabilityStatus averageRating isPremium premiumExpiry area lga state isAnonymous')
      .sort({ createdAt: -1 })
      .limit(12);

    const pub = {
      _id: user._id, name: user.name, role: user.role, profilePhoto: user.profilePhoto,
      bio: user.bio, university: user.university,
      phone: user.showPhone ? user.phone : null, createdAt: user.createdAt,
    };

    return apiSuccess({ user: pub, listings });
  } catch {
    return apiError('Server error', 500);
  }
}
