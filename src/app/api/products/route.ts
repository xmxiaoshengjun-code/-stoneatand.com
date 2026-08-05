import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';
import { successResponse, errorResponse } from '@/types/api';

/**
 * GET /api/products - Fetches a paginated, filtered list of published products.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      series: searchParams.get('series') || undefined,
      panelSize: searchParams.get('panelSize') || undefined,
      panelThickness: searchParams.get('panelThickness') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      isFeatured: searchParams.get('isFeatured') === 'true' ? true : undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 12,
      sort: searchParams.get('sort') || 'sortOrder',
    };

    const result = await productService.getProducts(params);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch products'), { status: 500 });
  }
}
