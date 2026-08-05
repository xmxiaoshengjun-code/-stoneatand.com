import { NextRequest, NextResponse } from 'next/server';
import { redirectService } from '@/lib/services/redirectService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * PUT /api/admin/redirects/[id] - Updates a redirect rule.
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
    const redirect = await redirectService.update(id, {
      sourceUrl: body.sourceUrl,
      targetUrl: body.targetUrl,
      isActive: body.isActive,
    });
    if (!redirect) {
      return NextResponse.json(errorResponse(404, 'Redirect not found'), { status: 404 });
    }
    return NextResponse.json(successResponse({ redirect }, 'Redirect updated'));
  } catch (error) {
    console.error('PUT /api/admin/redirects/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update redirect'), { status: 500 });
  }
}

/**
 * DELETE /api/admin/redirects/[id] - Deletes a redirect rule.
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
    await redirectService.delete(id);
    return NextResponse.json(successResponse({ success: true }, 'Redirect deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/redirects/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete redirect'), { status: 500 });
  }
}
