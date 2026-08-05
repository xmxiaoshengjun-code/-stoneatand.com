import { NextRequest, NextResponse } from 'next/server';
import { b2bListingService } from '@/lib/services/b2bListingService';
import { successResponse, errorResponse, createdResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/b2b-listings - Retrieves B2B listing records.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const productIdStr = searchParams.get('productId');
    const platform = searchParams.get('platform') || undefined;
    const status = searchParams.get('status') || undefined;

    const items = await b2bListingService.getAll({
      productId: productIdStr ? parseInt(productIdStr, 10) : undefined,
      platform,
      status,
    });
    return NextResponse.json(successResponse({ items }));
  } catch (error) {
    console.error('GET /api/admin/b2b-listings error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch B2B listings'), { status: 500 });
  }
}

/**
 * POST /api/admin/b2b-listings - Generates B2B product description content.
 * Body: { productId, platformName }
 */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (!body.productId || !body.platformName) {
      return NextResponse.json(errorResponse(400, 'productId and platformName are required'), { status: 400 });
    }

    const listing = await b2bListingService.generateContent(
      parseInt(body.productId, 10),
      body.platformName
    );
    return NextResponse.json(createdResponse({ listing }, 'B2B listing generated'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/b2b-listings error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate B2B listing';
    return NextResponse.json(errorResponse(500, message), { status: 500 });
  }
}
