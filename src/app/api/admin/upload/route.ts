import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * POST /api/admin/upload - Handles image file uploads.
 * Saves to /public/images/products/ with unique filename.
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
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`;
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/images/products/${filename}`;

    return NextResponse.json(successResponse({ url, filename }, 'File uploaded'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/upload error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to upload file'), { status: 500 });
  }
}
