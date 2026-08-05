import { NextRequest, NextResponse } from 'next/server';
import { categoryService } from '@/lib/services/categoryService';
import { successResponse, errorResponse, createdResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/categories - Retrieves the category tree.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const tree = await categoryService.getTree();
    return NextResponse.json(successResponse({ tree }));
  } catch (error) {
    console.error('GET /api/admin/categories error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch categories'), { status: 500 });
  }
}

/**
 * POST /api/admin/categories - Creates a new category.
 */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (!body.name || !body.slug) {
      return NextResponse.json(errorResponse(400, 'name and slug are required'), { status: 400 });
    }
    const category = await categoryService.create({
      name: body.name,
      slug: body.slug,
      prefix: body.prefix,
      parentId: body.parentId,
      description: body.description,
    });
    return NextResponse.json(createdResponse({ category }, 'Category created'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/categories error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to create category'), { status: 500 });
  }
}
