import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/services/contentService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * PUT /api/admin/content/pages/[id] - Update a content page.
 * DELETE /api/admin/content/pages/[id] - Delete a content page.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = Number(params.id);

    // P2-002: Check existence before updating
    const existing = await contentService.getContentPageById(id);
    if (!existing) {
      return NextResponse.json(errorResponse(404, 'Content page not found'), { status: 404 });
    }

    const body = await request.json();
    const page = await contentService.updateContentPage(id, body);
    return NextResponse.json(successResponse(page, 'Page updated'));
  } catch (error) {
    console.error('PUT /api/admin/content/pages/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update page'), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = Number(params.id);

    // P2-002: Check existence before deleting
    const existing = await contentService.getContentPageById(id);
    if (!existing) {
      return NextResponse.json(errorResponse(404, 'Content page not found'), { status: 404 });
    }

    await contentService.deleteContentPage(id);
    return NextResponse.json(successResponse(null, 'Page deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/content/pages/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete page'), { status: 500 });
  }
}
