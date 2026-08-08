import { NextRequest, NextResponse } from 'next/server';
import { redirectService } from '@/lib/services/redirectService';
import { successResponse, errorResponse, createdResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/redirects - Retrieves all redirect rules.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const items = await redirectService.getAll();
    return NextResponse.json(successResponse({ items }));
  } catch (error) {
    console.error('GET /api/admin/redirects error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch redirects'), { status: 500 });
  }
}

/**
 * POST /api/admin/redirects - Creates a new redirect rule.
 */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (!body.sourceUrl || !body.targetUrl) {
      return NextResponse.json(errorResponse(400, 'sourceUrl and targetUrl are required'), { status: 400 });
    }
    const redirect = await redirectService.create({
      sourceUrl: body.sourceUrl,
      targetUrl: body.targetUrl,
      isActive: body.isActive,
    });
    return NextResponse.json(createdResponse({ redirect }, 'Redirect created'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/redirects error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create redirect';

    // Catch unique constraint violation on sourceUrl → 409 Conflict.
    if (
      message.includes('UNIQUE constraint failed') ||
      message.includes('constraint failed') ||
      message.toLowerCase().includes('unique')
    ) {
      return NextResponse.json(
        errorResponse(409, 'Redirect with this source URL already exists'),
        { status: 409 }
      );
    }

    return NextResponse.json(errorResponse(500, message), { status: 500 });
  }
}
