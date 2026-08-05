import { NextRequest, NextResponse } from 'next/server';
import { friendLinkService } from '@/lib/services/friendLinkService';
import { successResponse, errorResponse, createdResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/friend-links - Retrieves all friend links.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const items = await friendLinkService.getAll();
    return NextResponse.json(successResponse({ items }));
  } catch (error) {
    console.error('GET /api/admin/friend-links error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch friend links'), { status: 500 });
  }
}

/**
 * POST /api/admin/friend-links - Creates a new friend link.
 */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (!body.name || !body.url) {
      return NextResponse.json(errorResponse(400, 'Name and URL are required'), { status: 400 });
    }
    const friendLink = await friendLinkService.create({
      name: body.name,
      url: body.url,
      logo: body.logo,
      sortOrder: body.sortOrder,
      isVisible: body.isVisible,
    });
    return NextResponse.json(createdResponse({ friendLink }, 'Friend link created'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/friend-links error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to create friend link'), { status: 500 });
  }
}
