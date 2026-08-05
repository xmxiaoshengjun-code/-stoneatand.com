import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/customerService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/customers - Admin customer list.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      keyword: searchParams.get('keyword') || undefined,
      status: (searchParams.get('status') as 'LEAD' | 'ACTIVE' | 'INACTIVE') || undefined,
      tag: (searchParams.get('tag') as 'BRAND_BUYER' | 'DESIGNER' | 'DISTRIBUTOR' | 'OTHER') || undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 20,
    };

    const result = await customerService.getCustomers(params);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('GET /api/admin/customers error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch customers'), { status: 500 });
  }
}
