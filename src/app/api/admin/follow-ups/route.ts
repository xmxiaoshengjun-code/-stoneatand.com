import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/customerService';
import { followUpCreateSchema } from '@/lib/validations/inquiry';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * POST /api/admin/follow-ups - Create a follow-up record.
 */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = followUpCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(400, 'Invalid input', parsed.error.flatten().fieldErrors as Record<string, string[]>),
        { status: 400 }
      );
    }

    const followUp = await customerService.createFollowUp(parsed.data);
    return NextResponse.json(successResponse(followUp, 'Follow-up created'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/follow-ups error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to create follow-up'), { status: 500 });
  }
}
