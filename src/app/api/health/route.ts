import { NextResponse } from 'next/server';
import { successResponse } from '@/types/api';

/**
 * GET /api/health - Health check endpoint.
 * Returns system status for monitoring.
 */
export async function GET() {
  return NextResponse.json(
    successResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    })
  );
}
