import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';
import { watermarkService } from '@/lib/services/watermarkService';
import { mediaLibraryService } from '@/lib/services/mediaLibraryService';

/**
 * POST /api/admin/upload - Handles image file uploads.
 * Saves to /public/images/products/ with unique filename.
 * Applies watermark if enabled in settings, then registers to MediaLibrary.
 */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(errorResponse(400, 'No file provided'), { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(errorResponse(400, 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(errorResponse(400, 'File too large. Maximum size is 5MB.'), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);

    // Apply watermark if enabled
    buffer = Buffer.from(await watermarkService.applyWatermark(buffer));

    // Generate unique filename
    const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`;
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/images/products/${filename}`;

    // Register to MediaLibrary
    let mediaId: number | undefined;
    try {
      let width: number | undefined;
      let height: number | undefined;
      try {
        const Jimp = (await import('jimp')).default;
        const img = await Jimp.read(buffer);
        width = img.bitmap.width;
        height = img.bitmap.height;
      } catch {
        // jimp not available; skip dimensions
      }
      const media = await mediaLibraryService.register({
        filename,
        url,
        category: 'product',
        fileSize: buffer.length,
        mimeType: file.type,
        width,
        height,
      });
      mediaId = media.id;
    } catch (regError) {
      console.error('MediaLibrary registration failed (non-fatal):', regError);
    }

    return NextResponse.json(
      successResponse({ url, filename, mediaId }, 'File uploaded'),
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/upload error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to upload file'), { status: 500 });
  }
}
