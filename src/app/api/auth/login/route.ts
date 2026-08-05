import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_OPTIONS, comparePassword } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse } from '@/types/api';

/**
 * POST /api/auth/login - Admin login. Returns JWT in httpOnly cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(400, 'Invalid input', parsed.error.flatten().fieldErrors as Record<string, string[]>),
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return NextResponse.json(errorResponse(401, 'Invalid email or password'), { status: 401 });
    }

    const isValid = await comparePassword(parsed.data.password, user.password);
    if (!isValid) {
      return NextResponse.json(errorResponse(401, 'Invalid email or password'), { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      successResponse(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        'Login successful'
      )
    );

    response.cookies.set(ADMIN_COOKIE_NAME, token, ADMIN_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json(errorResponse(500, 'Login failed'), { status: 500 });
  }
}
