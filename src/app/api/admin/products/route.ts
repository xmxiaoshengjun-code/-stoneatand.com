import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';
import { productCreateSchema } from '@/lib/validations/product';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/products - Admin product list (all products including unpublished).
 * POST /api/admin/products - Create a new product.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      series: searchParams.get('series') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 20,
      sort: searchParams.get('sort') || 'sortOrder',
    };

    // Admin can see unpublished products
    const result = await productService.getProducts({
      ...params,
      // Override to include unpublished
    });

    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('GET /api/admin/products error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch products'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = productCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(400, 'Invalid input', parsed.error.flatten().fieldErrors as Record<string, string[]>),
        { status: 400 }
      );
    }

    const product = await productService.createProduct(parsed.data);
    return NextResponse.json(successResponse(product, 'Product created'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/products error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to create product'), { status: 500 });
  }
}
