import { NextRequest, NextResponse } from 'next/server';
import { inquiryService } from '@/lib/services/inquiryService';
import { inquiryUpdateSchema } from '@/lib/validations/inquiry';
import { successResponse, errorResponse } from '@/types/api';

/**
 * GET /api/inquiries/[id] - Fetches a single inquiry with related data.
 * PATCH /api/inquiries/[id] - Updates inquiry status.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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
