import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import RoommateRequest from '@/models/RoommateRequest';
import { getAuthUser } from '@/lib/auth';
import { apiSuccess, apiError, paginate, omitFields } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page       = parseInt(searchParams.get('page') ?? '1');
    const university = searchParams.get('university') ?? '';
    const state      = searchParams.get('state') ?? '';
    const gender     = searchParams.get('gender') ?? '';
    const hasListing = searchParams.get('hasListing');
    const mine        = searchParams.get('mine') === 'true';
    const deviceId    = searchParams.get('deviceId') ?? '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { isDeleted: false };

    if (mine) {
      const auth = await getAuthUser(request);
      const ors: Record<string, unknown>[] = [];
      if (auth) ors.push({ userId: auth.id });
      if (deviceId) ors.push({ deviceId });
      if (ors.length === 0) return apiSuccess({ requests: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } });
      query.$or = ors;
    } else {
      query.isActive = true;
      if (university) query.university = university;
      if (state)        query.state = state;
      if (gender && gender !== 'Any') query.gender = { $in: [gender, 'Any'] };
      if (hasListing === 'true') query.hasListingDetails = true;
    }

    const { skip, limit } = paginate(page, 12);
    const [requestsRaw, total] = await Promise.all([
      RoommateRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      RoommateRequest.countDocuments(query),
    ]);

    const requests = requestsRaw.map(r => {
      const obj = r.toObject();
      // Owners viewing their own posts (via mine=true) keep isAnonymous as a display
      // flag only — deviceId itself is still never sent to the client.
      const safe = omitFields(obj, ['deviceId']);
      if (safe.isAnonymous && !mine) safe.userId = undefined;
      return safe;
    });

    return apiSuccess({ requests, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    const body = await request.json();
    const {
      isAnonymous, university, course, level, gender, budget, preferredArea, state,
      description, contactInfo, hasListingDetails, partialListing, deviceId,
    } = body;

    if (!deviceId) return apiError('Device identifier missing — please refresh and try again');
    if (!university) return apiError('University is required');
    if (!budget || budget <= 0) return apiError('Valid budget is required');
    if (!preferredArea || !state) return apiError('Preferred area and state are required');
    if (!description || description.trim().length < 20) return apiError('Description must be at least 20 characters');

    let displayName: string | undefined;
    if (!isAnonymous && auth) {
      const User = (await import('@/models/User')).default;
      const u = await User.findById(auth.id).select('name');
      displayName = u?.name;
    }

    const roommateRequest = await RoommateRequest.create({
      userId: auth?.id ?? undefined, deviceId, isAnonymous: !!isAnonymous, displayName: displayName ?? '',
      university, course: course || '', level: level || '', gender: gender || 'Any',
      budget: Number(budget), preferredArea, state, description: description.trim(),
      contactInfo: contactInfo || '', hasListingDetails: !!hasListingDetails,
      partialListing: hasListingDetails ? partialListing : undefined,
    });

    const obj = roommateRequest.toObject();
    const safe = omitFields(obj, ['deviceId']);

    return apiSuccess({ message: 'Roommate post created', request: safe }, 201);
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
