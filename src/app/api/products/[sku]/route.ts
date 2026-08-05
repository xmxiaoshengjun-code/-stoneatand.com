import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';
import { successResponse, errorResponse } from '@/types/api';

/**
 * GET /api/products/[sku] - Fetches a single product by SKU.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const product = await productService.getProductBySku(params.sku);
    if (!product) {
      return NextResponse.json(errorResponse(404, 'Product not found'), { status: 404 });
    }

    // Fetch related products
    const related = await productService.getRelatedProducts(
      product.id,
      product.seriesId,
      4
    );

    return NextResponse.json(successResponse({ product, related }));
  } catch (error) {
    console.error('GET /api/products/[sku] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch product'), { status: 500 });
  }
}
