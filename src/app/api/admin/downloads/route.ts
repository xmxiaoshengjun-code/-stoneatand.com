import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { downloadService } from '@/lib/services/downloadService';
import { successResponse, errorResponse, createdResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/downloads - Paginated list of download resources.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const result = await downloadService.getAll({ category, page, pageSize });
    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('GET /api/admin/downloads error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch downloads'), { status: 500 });
  }
}

/**
 * POST /api/admin/downloads - Creates a new download resource with file upload.
 * Accepts FormData with: file, title, description?, category?, sortOrder?
 */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const description = (formData.get('description') as string) || undefined;
    const category = (formData.get('category') as string) || undefined;
    const sortOrderStr = formData.get('sortOrder') as string | null;
    const sortOrder = sortOrderStr ? parseInt(sortOrderStr, 10) : undefined;

    if (!file) {
      return NextResponse.json(errorResponse(400, 'No file provided'), { status: 400 });
    }
    if (!title) {
      return NextResponse.json(errorResponse(400, 'Title is required'), { status: 400 });
    }

    // Validate file size (50MB max for documents)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(errorResponse(400, 'File too large. Maximum size is 50MB.'), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name) || '';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'downloads');
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const filePath = `/uploads/downloads/${filename}`;

    const download = await downloadService.create({
      title,
      description,
      filePath,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      category,
      sortOrder,
    });

    return NextResponse.json(createdResponse({ download }, 'Download created'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/downloads error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to create download'), { status: 500 });
  }
}
