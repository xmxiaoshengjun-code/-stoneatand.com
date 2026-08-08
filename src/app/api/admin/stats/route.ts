import { NextRequest, NextResponse } from 'next/server';
import { inquiryService } from '@/lib/services/inquiryService';
import { trackingService } from '@/lib/services/trackingService';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/stats - Dashboard statistics for the admin panel.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [inquiryStats, trackingStats, publishedProductCount, totalProductCount] = await Promise.all([
      inquiryService.getDashboardStats(),
      trackingService.getStats(30),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.product.count(),
    ]);

    return NextResponse.json(
      successResponse({
        inquiries: inquiryStats,
        tracking: trackingStats,
        products: {
          published: publishedProductCount,
          total: totalProductCount,
          unpublished: totalProductCount - publishedProductCount,
        },
      })
    );
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch stats'), { status: 500 });
  }
}
