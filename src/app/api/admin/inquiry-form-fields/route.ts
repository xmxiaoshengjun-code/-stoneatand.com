import { NextRequest, NextResponse } from 'next/server';
import { formFieldService } from '@/lib/services/formFieldService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/inquiry-form-fields - Retrieves all inquiry form field configurations.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const items = await formFieldService.getAll();
    return NextResponse.json(successResponse({ items }));
  } catch (error) {
    console.error('GET /api/admin/inquiry-form-fields error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch form fields'), { status: 500 });
  }
}

/**
 * PUT /api/admin/inquiry-form-fields - Batch-updates field configurations.
 * Body: { fields: [{ id, isActive?, sortOrder? }] }
 */
export async function PUT(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const fields = body.fields;

    if (!Array.isArray(fields)) {
      return NextResponse.json(errorResponse(400, 'fields must be an array'), { status: 400 });
    }

    const items = await formFieldService.updateFields(fields);
    return NextResponse.json(successResponse({ items }, 'Form fields updated'));
  } catch (error) {
    console.error('PUT /api/admin/inquiry-form-fields error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update form fields'), { status: 500 });
  }
}
