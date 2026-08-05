import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/services/contentService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/content/pages - List all content pages.
 * POST /api/admin/content/pages - Create or update a content page.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const pages = await contentService.getAllContentPages();
    return NextResponse.json(successResponse(pages));
  } catch (error) {
    console.error('GET /api/admin/content/pages error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch content pages'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const page = await contentService.upsertContentPage(body);
    return NextResponse.json(successResponse(page, 'Content page saved'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/content/pages error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to save content page'), { status: 500 });
  }
}
