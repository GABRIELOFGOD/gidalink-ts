import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return apiError('Unauthorized', 401);

    const { id } = await params;

    // For now, we're storing bookmarks client-side in localStorage
    // In the future, this can be extended to store in database
    // This endpoint primarily validates that user is authenticated

    return apiSuccess({ message: 'Listing bookmarked' });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) return apiError('Unauthorized', 401);

    const { id } = await params;

    // For now, we're removing bookmarks from client-side localStorage
    // This endpoint primarily validates that user is authenticated

    return apiSuccess({ message: 'Listing removed from bookmarks' });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
