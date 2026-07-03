import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if (!auth) return apiError('Unauthorized', 401);

    const { id } = await params;

    // Add listing to user's bookmarks
    const user = await User.findByIdAndUpdate(
      auth.id,
      { $addToSet: { bookmarkedListings: id } },
      { new: true }
    );

    if (!user) return apiError('User not found', 404);

    return apiSuccess({ 
      message: 'Listing bookmarked',
      bookmarkedListings: user.bookmarkedListings 
    });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if (!auth) return apiError('Unauthorized', 401);

    const { id } = await params;

    // Remove listing from user's bookmarks
    const user = await User.findByIdAndUpdate(
      auth.id,
      { $pull: { bookmarkedListings: id } },
      { new: true }
    );

    if (!user) return apiError('User not found', 404);

    return apiSuccess({ 
      message: 'Listing removed from bookmarks',
      bookmarkedListings: user.bookmarkedListings 
    });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if (!auth) return apiSuccess({ isBookmarked: false });

    const { id } = await params;

    // Check if listing is in user's bookmarks
    const user = await User.findById(auth.id);
    if (!user) return apiSuccess({ isBookmarked: false });

    const isBookmarked = user.bookmarkedListings.includes(id);

    return apiSuccess({ 
      isBookmarked,
      bookmarkedListings: user.bookmarkedListings 
    });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
