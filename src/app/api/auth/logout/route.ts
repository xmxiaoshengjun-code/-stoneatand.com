import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';
import { successResponse } from '@/types/api';

/**
 * POST /api/auth/logout - Clears the admin JWT cookie.
 */
export async function POST() {
  const response = NextResponse.json(successResponse(null, 'Logged out successfully'));
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
