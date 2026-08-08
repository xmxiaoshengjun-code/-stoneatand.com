import { NextRequest, NextResponse } from 'next/server';
import { inquiryService } from '@/lib/services/inquiryService';
import { inquiryUpdateSchema } from '@/lib/validations/inquiry';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/inquiries/[id] - Fetches a single inquiry with related data (admin only).
 * PATCH /api/inquiries/[id] - Updates inquiry status (admin only).
 * DELETE /api/inquiries/[id] - Deletes an inquiry (admin only).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(errorResponse(400, 'Invalid inquiry ID'), { status: 400 });
    }

    const inquiry = await inquiryService.getInquiryById(id);
    if (!inquiry) {
      return NextResponse.json(errorResponse(404, 'Inquiry not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(inquiry));
  } catch (error) {
    console.error('GET /api/inquiries/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch inquiry'), { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(errorResponse(400, 'Invalid inquiry ID'), { status: 400 });
    }

    const body = await request.json();
    const parsed = inquiryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(400, 'Invalid input', parsed.error.flatten().fieldErrors as Record<string, string[]>),
        { status: 400 }
      );
    }

    const inquiry = await inquiryService.updateInquiryStatus(
      id,
      parsed.data.status,
      parsed.data.assignedTo
    );
    return NextResponse.json(successResponse(inquiry, 'Inquiry updated'));
  } catch (error) {
    console.error('PATCH /api/inquiries/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update inquiry'), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(errorResponse(400, 'Invalid inquiry ID'), { status: 400 });
    }

    const deleted = await inquiryService.deleteInquiry(id);
    if (!deleted) {
      return NextResponse.json(errorResponse(404, 'Inquiry not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(null, 'Inquiry deleted'));
  } catch (error) {
    console.error('DELETE /api/inquiries/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete inquiry'), { status: 500 });
  }
}
