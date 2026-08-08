import { NextRequest, NextResponse } from 'next/server';
import { categoryService } from '@/lib/services/categoryService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/categories/[id] - Fetches a single category by ID.
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
      return NextResponse.json(errorResponse(400, 'Invalid category ID'), { status: 400 });
    }

    const category = await categoryService.getById(id);
    if (!category) {
      return NextResponse.json(errorResponse(404, 'Category not found'), { status: 404 });
    }
    return NextResponse.json(successResponse({ category }));
  } catch (error) {
    console.error('GET /api/admin/categories/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch category'), { status: 500 });
  }
}

/**
 * PUT /api/admin/categories/[id] - Updates a category.
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
    const category = await categoryService.update(id, {
      name: body.name,
      description: body.description,
      parentId: body.parentId,
    });
    if (!category) {
      return NextResponse.json(errorResponse(404, 'Category not found'), { status: 404 });
    }
    return NextResponse.json(successResponse({ category }, 'Category updated'));
  } catch (error) {
    console.error('PUT /api/admin/categories/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update category';
    return NextResponse.json(errorResponse(500, message), { status: 500 });
  }
}

/**
 * DELETE /api/admin/categories/[id] - Deletes a category (must have no children/products).
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
    await categoryService.delete(id);
    return NextResponse.json(successResponse({ success: true }, 'Category deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/categories/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete category';
    return NextResponse.json(errorResponse(500, message), { status: 500 });
  }
}
