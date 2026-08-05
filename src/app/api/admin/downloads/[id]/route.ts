import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { downloadService } from '@/lib/services/downloadService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/downloads/[id] - Retrieves a single download resource.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id, 10);
    const download = await downloadService.getById(id);
    if (!download) {
      return NextResponse.json(errorResponse(404, 'Download not found'), { status: 404 });
    }
    return NextResponse.json(successResponse({ download }));
  } catch (error) {
    console.error('GET /api/admin/downloads/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch download'), { status: 500 });
  }
}

/**
 * PUT /api/admin/downloads/[id] - Updates a download resource.
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
    const download = await downloadService.update(id, {
      title: body.title,
      description: body.description,
      category: body.category,
      sortOrder: body.sortOrder,
      isPublished: body.isPublished,
    });
    if (!download) {
      return NextResponse.json(errorResponse(404, 'Download not found'), { status: 404 });
    }
    return NextResponse.json(successResponse({ download }, 'Download updated'));
  } catch (error) {
    console.error('PUT /api/admin/downloads/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update download'), { status: 500 });
  }
}

/**
 * DELETE /api/admin/downloads/[id] - Deletes a download resource and its file.
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
    const download = await downloadService.getById(id);
    if (!download) {
      return NextResponse.json(errorResponse(404, 'Download not found'), { status: 404 });
    }

    // Delete the file from disk
    if (download.filePath) {
      const filePath = path.join(process.cwd(), 'public', download.filePath);
      try {
        await unlink(filePath);
      } catch {
        // File may not exist; ignore error
      }
    }

    await downloadService.delete(id);
    return NextResponse.json(successResponse({ success: true }, 'Download deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/downloads/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete download'), { status: 500 });
  }
}
