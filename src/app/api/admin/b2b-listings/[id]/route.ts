import { NextRequest, NextResponse } from 'next/server';
import { b2bListingService } from '@/lib/services/b2bListingService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/b2b-listings/[id] - Fetches a single B2B listing by ID.
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
    if (isNaN(id)) {
      return NextResponse.json(errorResponse(400, 'Invalid listing ID'), { status: 400 });
    }

    const listing = await b2bListingService.getById(id);
    if (!listing) {
      return NextResponse.json(errorResponse(404, 'B2B listing not found'), { status: 404 });
    }
    return NextResponse.json(successResponse({ listing }));
  } catch (error) {
    console.error('GET /api/admin/b2b-listings/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch B2B listing'), { status: 500 });
  }
}

/**
 * PUT /api/admin/b2b-listings/[id] - Updates a B2B listing record.
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
    const listing = await b2bListingService.update(id, {
      listingUrl: body.listingUrl,
      status: body.status,
      generatedContent: body.generatedContent,
    });
    if (!listing) {
      return NextResponse.json(errorResponse(404, 'B2B listing not found'), { status: 404 });
    }
    return NextResponse.json(successResponse({ listing }, 'B2B listing updated'));
  } catch (error) {
    console.error('PUT /api/admin/b2b-listings/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update B2B listing'), { status: 500 });
  }
}

/**
 * DELETE /api/admin/b2b-listings/[id] - Deletes a B2B listing record.
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
    await b2bListingService.delete(id);
    return NextResponse.json(successResponse({ success: true }, 'B2B listing deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/b2b-listings/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete B2B listing'), { status: 500 });
  }
}
