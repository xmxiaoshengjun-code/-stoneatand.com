import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/services/contentService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/content/testimonials - List all testimonials.
 * POST /api/admin/content/testimonials - Create or update a testimonial.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const testimonials = await contentService.getAllTestimonials();
    return NextResponse.json(successResponse(testimonials));
  } catch (error) {
    console.error('GET /api/admin/content/testimonials error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch testimonials'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();

    // P2-007: Validate rating is between 1 and 5
    if (body.rating !== undefined) {
      const rating = Number(body.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return NextResponse.json(
          errorResponse(400, 'Rating must be an integer between 1 and 5'),
          { status: 400 }
        );
      }
      body.rating = rating;
    }

    const testimonial = await contentService.upsertTestimonial(body);
    return NextResponse.json(successResponse(testimonial, 'Testimonial saved'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/content/testimonials error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to save testimonial'), { status: 500 });
  }
}
