import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/products/[id] - Fetch a product by ID (admin).
 * PUT /api/admin/products/[id] - Update a product.
 * DELETE /api/admin/products/[id] - Soft-delete (unpublish) a product.
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
      return NextResponse.json(errorResponse(400, 'Invalid product ID'), { status: 400 });
    }

    const product = await productService.getProductById(id);
    if (!product) {
      return NextResponse.json(errorResponse(404, 'Product not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(product));
  } catch (error) {
    console.error('GET /api/admin/products/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch product'), { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(errorResponse(400, 'Invalid product ID'), { status: 400 });
    }

    const body = await request.json();
    const product = await productService.updateProduct(id, body);
    return NextResponse.json(successResponse(product, 'Product updated'));
  } catch (error) {
    console.error('PUT /api/admin/products/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update product'), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(errorResponse(400, 'Invalid product ID'), { status: 400 });
    }

    await productService.deleteProduct(id);
    return NextResponse.json(successResponse(null, 'Product deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/products/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete product'), { status: 500 });
  }
}
