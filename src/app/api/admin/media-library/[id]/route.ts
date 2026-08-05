import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { mediaLibraryService } from '@/lib/services/mediaLibraryService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * PUT /api/admin/media-library/[id] - Updates media metadata (alt, category).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const media = await mediaLibraryService.update(id, {
      alt: body.alt,
      category: body.category,
    });
    if (!media) {
      return NextResponse.json(errorResponse(404, 'Media not found'), { status: 404 });
    }
    return NextResponse.json(successResponse({ media }, 'Media updated'));
  } catch (error) {
    console.error('PUT /api/admin/media-library/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update media'), { status: 500 });
  }
}

/**
 * DELETE /api/admin/media-library/[id] - Deletes a media record and its file.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id, 10);
    const media = await mediaLibraryService.getById(id);
    if (!media) {
      return NextResponse.json(errorResponse(404, 'Media not found'), { status: 404 });
    }

    // Delete the file from disk
    if (media.url) {
      const filePath = path.join(process.cwd(), 'public', media.url);
      try {
        await unlink(filePath);
      } catch {
        // File may not exist; ignore error
      }
    }

    await mediaLibraryService.delete(id);
    return NextResponse.json(successResponse({ success: true }, 'Media deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/media-library/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete media'), { status: 500 });
  }
}
