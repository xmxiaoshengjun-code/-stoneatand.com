import { NextRequest, NextResponse } from 'next/server';
import { friendLinkService } from '@/lib/services/friendLinkService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * PUT /api/admin/friend-links/[id] - Updates a friend link.
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
    const friendLink = await friendLinkService.update(id, {
      name: body.name,
      url: body.url,
      logo: body.logo,
      sortOrder: body.sortOrder,
      isVisible: body.isVisible,
    });
    if (!friendLink) {
      return NextResponse.json(errorResponse(404, 'Friend link not found'), { status: 404 });
    }
    return NextResponse.json(successResponse({ friendLink }, 'Friend link updated'));
  } catch (error) {
    console.error('PUT /api/admin/friend-links/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update friend link'), { status: 500 });
  }
}

/**
 * DELETE /api/admin/friend-links/[id] - Deletes a friend link.
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
    await friendLinkService.delete(id);
    return NextResponse.json(successResponse({ success: true }, 'Friend link deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/friend-links/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete friend link'), { status: 500 });
  }
}
