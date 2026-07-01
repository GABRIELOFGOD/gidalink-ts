import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';
import { getAuthUser } from '@/lib/auth';
import { apiSuccess, apiError, paginate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page          = parseInt(searchParams.get('page') ?? '1');
    const limit          = parseInt(searchParams.get('limit') ?? '12');
    const search          = searchParams.get('search') ?? '';
    const listingType     = searchParams.get('listingType') ?? '';
    const apartmentType   = searchParams.get('apartmentType') ?? '';
    const nearbyUniversity = searchParams.get('nearbyUniversity') ?? '';
    const state           = searchParams.get('state') ?? '';
    const lga             = searchParams.get('lga') ?? '';
    const minRent         = searchParams.get('minRent') ? Number(searchParams.get('minRent')) : null;
    const maxRent         = searchParams.get('maxRent') ? Number(searchParams.get('maxRent')) : null;
    const waterSupply     = searchParams.get('waterSupply') ?? '';
    const powerSupply     = searchParams.get('powerSupply') ?? '';
    const furnishing      = searchParams.get('furnishing') ?? '';
    const availability    = searchParams.get('availability') ?? '';
    const condition       = searchParams.get('condition') ?? '';
    const sort            = searchParams.get('sort') ?? 'premium';
    const mine             = searchParams.get('mine') === 'true';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { isDeleted: false };
    let requesterId: string | null = null;

    if (mine) {
      const auth = await getAuthUser(request);
      if (!auth) return apiError('Unauthorized', 401);
      requesterId = auth.id;
      query.creator = auth.id; // owner sees ALL their own listings, anonymous or not
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { area:  { $regex: search, $options: 'i' } },
        { lga:   { $regex: search, $options: 'i' } },
        { streetAddress: { $regex: search, $options: 'i' } },
        { nearbyUniversity: { $regex: search, $options: 'i' } },
      ];
    }
    if (listingType)      query.listingType = listingType;
    if (apartmentType)    query.apartmentType = apartmentType;
    if (nearbyUniversity) query.nearbyUniversity = nearbyUniversity;
    if (state)             query.state = state;
    if (lga)                query.lga = { $regex: lga, $options: 'i' };
    if (minRent || maxRent) {
      query.annualRent = {};
      if (minRent) query.annualRent.$gte = minRent;
      if (maxRent) query.annualRent.$lte = maxRent;
    }
    if (waterSupply)  query.waterSupply = { $in: waterSupply.split(',') };
    if (powerSupply)  query.powerSupply = { $in: powerSupply.split(',') };
    if (furnishing)   query.furnishingStatus = furnishing;
    if (availability) query.availabilityStatus = availability;
    if (condition)    query.buildingCondition = condition;

    let sortObj: Record<string, 1 | -1> = { isPremium: -1, createdAt: -1 };
    if (sort === 'newest')      sortObj = { createdAt: -1 };
    else if (sort === 'oldest')      sortObj = { createdAt: 1 };
    else if (sort === 'price_asc')   sortObj = { annualRent: 1 };
    else if (sort === 'price_desc')  sortObj = { annualRent: -1 };
    else if (sort === 'rating')      sortObj = { averageRating: -1 };

    const { skip } = paginate(page, limit);
    const [listingsRaw, total] = await Promise.all([
      Listing.find(query).sort(sortObj).skip(skip).limit(limit).populate('creator', 'name profilePhoto role phone showPhone'),
      Listing.countDocuments(query),
    ]);

    const now = new Date();
    const listings = listingsRaw.map(l => {
      const obj = l.toObject() as ReturnType<typeof l.toObject> & { isPremium: boolean; monthlyRent: number; creator: unknown };
      obj.isPremium = l.isPremium && l.premiumExpiry !== null && l.premiumExpiry > now;
      obj.monthlyRent = Math.round(obj.annualRent / 12);
      // Strip identity if anonymous — UNLESS this is the owner viewing their own listing via mine=true
      const isOwnerViewing = requesterId && l.creator.toString() === requesterId;
      if (obj.isAnonymous && !isOwnerViewing) obj.creator = null;
      return obj;
    });

    return apiSuccess({ listings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}

export async function POST(request: NextRequest) {
  // Anonymous / no-login posting allowed — but we still need SOME identity
  // for the database (creator field is required). If not logged in, we
  // reject with a clear message since the schema requires a creator ID.
  const auth = await getAuthUser(request);

  try {
    await connectDB();
    const body = await request.json();
    const {
      title, listingType, apartmentType, nearbyUniversity, distanceFromCampus, roomType,
      genderPolicy, studentAmenities, streetAddress, area, lga, state, coordinates,
      annualRent, drainageCondition, waterSupply, powerSupply, buildingCondition,
      securityType, furnishingStatus, availabilityStatus, additionalNotes, photos,
      agencyFee, isAnonymous,
    } = body;

    if (!title || !apartmentType || !streetAddress || !area || !lga || !state || !annualRent)
      return apiError('Please fill all required fields');
    if (!photos || photos.length === 0) return apiError('At least one photo is required');

    if (!auth) {
      return apiError('Please create a free account to post a listing. You can still post anonymously after signing up — your identity will be hidden from other users.', 401);
    }

    const listing = await Listing.create({
      title, listingType: listingType || 'hostel', apartmentType,
      nearbyUniversity: nearbyUniversity || '', distanceFromCampus: distanceFromCampus || '',
      roomType: roomType || '', genderPolicy: genderPolicy || '', studentAmenities: studentAmenities || [],
      streetAddress, area, lga, state, coordinates: coordinates?.lat ? coordinates : null,
      annualRent: Number(annualRent), drainageCondition, waterSupply: waterSupply || [],
      powerSupply: powerSupply || [], buildingCondition, securityType: securityType || [],
      furnishingStatus, availabilityStatus: availabilityStatus || 'Available',
      additionalNotes: additionalNotes || '', photos, creator: auth.id,
      isAnonymous: !!isAnonymous,
      agencyFee: auth.role === 'agent' ? (agencyFee || '') : '',
    });

    await listing.populate('creator', 'name profilePhoto role');
    const obj = listing.toObject() as ReturnType<typeof listing.toObject> & { creator: unknown };
    if (obj.isAnonymous) obj.creator = null;

    return apiSuccess({ message: 'Listing created', listing: obj }, 201);
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
