import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/types/api';

/**
 * GET /api/auth/me - Returns the current authenticated admin user.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(errorResponse(401, 'Not authenticated'), { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(errorResponse(401, 'Invalid or expired token'), { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json(errorResponse(401, 'User not found'), { status: 401 });
    }

    return NextResponse.json(successResponse(user));
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch user'), { status: 500 });
  }
}
