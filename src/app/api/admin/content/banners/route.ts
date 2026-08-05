import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/services/contentService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/content/banners - List all banners.
 * POST /api/admin/content/banners - Create or update a banner.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const banners = await contentService.getAllBanners();
    return NextResponse.json(successResponse(banners));
  } catch (error) {
    console.error('GET /api/admin/content/banners error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch banners'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const banner = await contentService.upsertBanner(body);
    return NextResponse.json(successResponse(banner, 'Banner saved'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/content/banners error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to save banner'), { status: 500 });
  }
}
