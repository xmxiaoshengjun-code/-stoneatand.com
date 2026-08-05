import { NextResponse } from 'next/server';
import { contentService } from '@/lib/services/contentService';
import { successResponse, errorResponse } from '@/types/api';

/**
 * GET /api/regions - Fetches all available regions.
 */
export async function GET() {
  try {
    const regions = await contentService.getRegions();
    return NextResponse.json(successResponse(regions));
  } catch (error) {
    console.error('GET /api/regions error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch regions'), { status: 500 });
  }
}
