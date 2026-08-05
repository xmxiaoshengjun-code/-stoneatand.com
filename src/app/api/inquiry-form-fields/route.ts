import { NextRequest, NextResponse } from 'next/server';
import { formFieldService } from '@/lib/services/formFieldService';
import { successResponse, errorResponse } from '@/types/api';

/**
 * GET /api/inquiry-form-fields - Public API.
 * Returns active inquiry form field configurations for dynamic form rendering.
 * No authentication required.
 */
export async function GET(_request: NextRequest) {
  try {
    const items = await formFieldService.getActiveFields();
    return NextResponse.json(successResponse({ items }));
  } catch (error) {
    console.error('GET /api/inquiry-form-fields error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch form fields'), { status: 500 });
  }
}
