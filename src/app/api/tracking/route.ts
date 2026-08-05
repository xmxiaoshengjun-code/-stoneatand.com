import { NextRequest, NextResponse } from 'next/server';
import { trackingService } from '@/lib/services/trackingService';
import { successResponse, errorResponse } from '@/types/api';

/**
 * POST /api/tracking - Records a visitor behavior tracking event.
 * Accepts referrer, deviceType, and sourceCategory in addition to existing fields.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await trackingService.trackEvent({
      sessionId: body.sessionId || null,
      customerId: body.customerId || null,
      eventType: body.eventType || 'unknown',
      pageUrl: body.pageUrl || null,
      productId: body.productId || null,
      searchData: body.searchData || null,
      duration: body.duration || null,
      country: body.country || null,
      referrer: body.referrer || null,
      deviceType: body.deviceType || null,
      sourceCategory: body.sourceCategory || null,
    });

    return NextResponse.json(successResponse(null, 'Event tracked'), { status: 201 });
  } catch (error) {
    console.error('POST /api/tracking error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to track event'), { status: 500 });
  }
}
