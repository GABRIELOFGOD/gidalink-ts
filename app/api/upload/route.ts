import { NextRequest } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { apiSuccess, apiError } from '@/lib/utils';

// Note: intentionally NOT gated behind requireAuth — anonymous / logged-out
// users can post roommate requests with photos, so uploads must work for them too.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    if (!files.length) return apiError('No files provided');
    if (files.length > 10) return apiError('Maximum 10 files allowed');

    const results = await Promise.all(
      files.map(async file => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadToCloudinary(buffer, {
          folder: 'gidalink/listings',
          transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 80 }],
        });
        return { url: result.url, publicId: result.publicId };
      })
    );

    return apiSuccess({ files: results });
  } catch (e) {
    console.error(e);
    return apiError(`Upload failed: ${e instanceof Error ? e.message : 'unknown error'}`, 500);
  }
}
