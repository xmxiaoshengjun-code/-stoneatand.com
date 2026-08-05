import { NextRequest, NextResponse } from 'next/server';
import { trackingService } from '@/lib/services/trackingService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

type TimeRange = 'today' | 'yesterday' | '7d' | '30d';

/**
 * GET /api/admin/tracking/stats - Comprehensive tracking statistics for the
 * admin dashboard: today UV/PV, average duration, top pages, top countries,
 * 7-day trend data, hourly trend, traffic sources, and device distribution.
 *
 * Supports ?timeRange=today|yesterday|7d|30d query parameter.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const timeRangeParam = searchParams.get('timeRange') as TimeRange | null;
    const validRanges: TimeRange[] = ['today', 'yesterday', '7d', '30d'];
    const timeRange = timeRangeParam && validRanges.includes(timeRangeParam)
      ? timeRangeParam
      : '7d';

    const stats = await trackingService.getDashboardStats(timeRange);
    return NextResponse.json(successResponse(stats));
  } catch (error) {
    console.error('GET /api/admin/tracking/stats error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch tracking stats'), { status: 500 });
  }
}
