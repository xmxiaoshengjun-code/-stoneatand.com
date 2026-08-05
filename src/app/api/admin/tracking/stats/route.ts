import { NextRequest, NextResponse } from 'next/server';
import { trackingService } from '@/lib/services/trackingService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/tracking/stats - Comprehensive tracking statistics for the
 * admin dashboard: today UV/PV, average duration, top pages, top countries,
 * and 7-day trend data.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const stats = await trackingService.getDashboardStats();
    return NextResponse.json(successResponse(stats));
  } catch (error) {
    console.error('GET /api/admin/tracking/stats error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch tracking stats'), { status: 500 });
  }
}
