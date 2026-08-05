import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { mediaLibraryService } from '@/lib/services/mediaLibraryService';
import { successResponse, errorResponse, createdResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/media-library - Paginated list of media items.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '24', 10);

    const result = await mediaLibraryService.getAll({ category, page, pageSize });
    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('GET /api/admin/media-library error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch media library'), { status: 500 });
  }
}

/**
 * POST /api/admin/media-library - Uploads an image and registers it in the media library.
 * Accepts FormData with: file, category?, alt?
 */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'general';
    const alt = (formData.get('alt') as string) || undefined;

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
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`;
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'media');
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/images/media/${filename}`;

    // Get image dimensions
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
      alt,
      category,
      fileSize: file.size,
      mimeType: file.type,
      width,
      height,
    });

    return NextResponse.json(createdResponse({ media }, 'Image uploaded'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/media-library error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to upload image'), { status: 500 });
  }
}
