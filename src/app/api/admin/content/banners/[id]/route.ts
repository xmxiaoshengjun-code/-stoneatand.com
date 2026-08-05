import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/services/contentService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * PUT /api/admin/content/banners/[id] - Update a banner.
 * DELETE /api/admin/content/banners/[id] - Delete a banner.
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
    const existing = await contentService.getBannerById(id);
    if (!existing) {
      return NextResponse.json(errorResponse(404, 'Banner not found'), { status: 404 });
    }

    const body = await request.json();
    const banner = await contentService.upsertBanner({ ...body, id });
    return NextResponse.json(successResponse(banner, 'Banner updated'));
  } catch (error) {
    console.error('PUT /api/admin/content/banners/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update banner'), { status: 500 });
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
    const existing = await contentService.getBannerById(id);
    if (!existing) {
      return NextResponse.json(errorResponse(404, 'Banner not found'), { status: 404 });
    }

    await contentService.deleteBanner(id);
    return NextResponse.json(successResponse(null, 'Banner deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/content/banners/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete banner'), { status: 500 });
  }
}
