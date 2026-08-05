import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/lib/services/settingsService';
import { successResponse, errorResponse } from '@/types/api';

/**
 * GET /api/public-settings - Public API.
 * Returns non-sensitive site settings for frontend use.
 * Only exposes: siteFavicon, gaTrackingId, copyProtectionEnabled, enabledLocales.
 * No authentication required.
 */
export async function GET(_request: NextRequest) {
  try {
    const all = await settingsService.getAll();
    return NextResponse.json(
      successResponse({
        siteFavicon: all.siteFavicon || '',
        gaTrackingId: all.gaTrackingId || '',
        copyProtectionEnabled: all.copyProtectionEnabled || 'false',
        enabledLocales: all.enabledLocales || 'en,fr,de,it,es',
      })
    );
  } catch (error) {
    console.error('GET /api/public-settings error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch public settings'), { status: 500 });
  }
}
