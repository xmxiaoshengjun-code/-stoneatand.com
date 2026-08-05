import { NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';
import { successResponse, errorResponse } from '@/types/api';

/**
 * GET /api/products/featured - Fetches featured products for homepage.
 */
export async function GET() {
  try {
    const products = await productService.getFeaturedProducts(8);
    return NextResponse.json(successResponse(products));
  } catch (error) {
    console.error('GET /api/products/featured error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch featured products'), { status: 500 });
  }
}
