import { NextRequest, NextResponse } from 'next/server';
import { inquiryService } from '@/lib/services/inquiryService';
import { inquiryCreateSchema } from '@/lib/validations/inquiry';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * POST /api/inquiries - Creates a new inquiry from the website (public).
 * GET /api/inquiries - Lists inquiries (admin only).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = inquiryCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(400, 'Invalid input', parsed.error.flatten().fieldErrors as Record<string, string[]>),
        { status: 400 }
      );
    }

    const inquiry = await inquiryService.createInquiry(parsed.data);
    return NextResponse.json(successResponse(inquiry, 'Inquiry submitted successfully'), { status: 201 });
  } catch (error) {
    console.error('POST /api/inquiries error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to submit inquiry'), { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      status: (searchParams.get('status') as 'NEW' | 'CONTACTED' | 'QUOTED' | 'NEGOTIATING' | 'WON' | 'LOST') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 20,
    };

    const result = await inquiryService.getInquiries(params);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('GET /api/inquiries error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch inquiries'), { status: 500 });
  }
}
