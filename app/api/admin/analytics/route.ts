import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Listing from '@/models/Listing';
import Payment from '@/models/Payment';
import Review from '@/models/Review';
import RoommateRequest from '@/models/RoommateRequest';
import { requireAdmin } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  try {
    await connectDB();

    const [
      totalUsers, totalListings, totalPayments, totalReviews, totalRoommates,
      students, hostelOwners, agents,
      availableListings, premiumListings, flaggedListings, anonymousListings,
      successPayments, pendingPayments,
      recentUsers, recentListings,
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments({ isDeleted: false }),
      Payment.countDocuments({ status: 'success' }),
      Review.countDocuments({ isDeleted: false }),
      RoommateRequest.countDocuments({ isDeleted: false }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'hostel_owner' }),
      User.countDocuments({ role: 'agent' }),
      Listing.countDocuments({ availabilityStatus: 'Available', isDeleted: false }),
      Listing.countDocuments({ isPremium: true, premiumExpiry: { $gt: new Date() }, isDeleted: false }),
      Listing.countDocuments({ isFlagged: true, isDeleted: false }),
      Listing.countDocuments({ isAnonymous: true, isDeleted: false }),
      Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' }, fees: { $sum: '$platformFee' } } }]),
      Payment.countDocuments({ status: 'pending' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Listing.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).select('title apartmentType annualRent availabilityStatus creator isAnonymous createdAt').populate('creator', 'name'),
    ]);

    const revenue = successPayments[0] ?? { total: 0, fees: 0 };

    return apiSuccess({
      stats: {
        users: { total: totalUsers, students, hostelOwners, agents },
        listings: { total: totalListings, available: availableListings, premium: premiumListings, flagged: flaggedListings, anonymous: anonymousListings },
        payments: { total: totalPayments, pending: pendingPayments, volume: revenue.total, platformRevenue: revenue.fees },
        reviews: { total: totalReviews },
        roommates: { total: totalRoommates },
      },
      recentUsers,
      recentListings,
    });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
