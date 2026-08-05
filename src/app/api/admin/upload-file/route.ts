import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { successResponse, errorResponse, createdResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * POST /api/admin/upload-file - Handles non-image file uploads (PDF, DOC, XLS, etc.).
 * Saves to /public/uploads/files/ with unique filename.
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

    // Validate file type — allow common document types
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.zip'];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        errorResponse(400, `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`),
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(errorResponse(400, 'File too large. Maximum size is 50MB.'), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'files');
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/files/${filename}`;

    return NextResponse.json(
      createdResponse({ url, filename, fileSize: file.size }, 'File uploaded'),
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/upload-file error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to upload file'), { status: 500 });
  }
}
