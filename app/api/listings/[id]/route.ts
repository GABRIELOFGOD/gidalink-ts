import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';
import { requireAuth, getAuthUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const listing = await Listing.findOne({ _id: id, isDeleted: false })
      .populate('creator', 'name profilePhoto role phone showPhone bio createdAt');
    if (!listing) return apiError('Listing not found', 404);

    await Listing.findByIdAndUpdate(id, { $inc: { views: 1 } });

    const auth = await getAuthUser(request);
    const obj = listing.toObject() as ReturnType<typeof listing.toObject> & { isPremium: boolean; monthlyRent: number };
    obj.isPremium = listing.isPremium && listing.premiumExpiry !== null && listing.premiumExpiry > new Date();
    obj.monthlyRent = Math.round(obj.annualRent / 12);

    const isOwner = auth && listing.creator?._id?.toString() === auth.id;

    if (obj.isAnonymous && !isOwner) {
      obj.creator = null;
    } else if (obj.creator && !obj.creator.showPhone && !isOwner) {
      obj.creator.phone = null;
    }

    return apiSuccess({ listing: obj });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    const listing = await Listing.findOne({ _id: id, isDeleted: false });
    if (!listing) return apiError('Listing not found', 404);
    if (listing.creator.toString() !== user.id && user.role !== 'admin') return apiError('Forbidden', 403);

    const body = await request.json();
    const allowed = [
      'title','listingType','apartmentType','nearbyUniversity','distanceFromCampus','roomType','genderPolicy',
      'studentAmenities','streetAddress','area','lga','state','coordinates','annualRent','drainageCondition',
      'waterSupply','powerSupply','buildingCondition','securityType','furnishingStatus','availabilityStatus',
      'additionalNotes','photos','agencyFee','isAnonymous',
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allowed.forEach(k => { if (body[k] !== undefined) (listing as any)[k] = body[k]; });
    await listing.save();

    return apiSuccess({ message: 'Listing updated', listing });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    const listing = await Listing.findOne({ _id: id, isDeleted: false });
    if (!listing) return apiError('Listing not found', 404);
    if (listing.creator.toString() !== user.id && user.role !== 'admin') return apiError('Forbidden', 403);

    listing.isDeleted = true;
    await listing.save();
    return apiSuccess({ message: 'Listing deleted' });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
