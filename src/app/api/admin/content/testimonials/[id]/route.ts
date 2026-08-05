import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/services/contentService';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * PUT /api/admin/content/testimonials/[id] - Update a testimonial.
 * DELETE /api/admin/content/testimonials/[id] - Delete a testimonial.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = Number(params.id);

    // P2-002: Check existence before updating
    const existing = await contentService.getTestimonialById(id);
    if (!existing) {
      return NextResponse.json(errorResponse(404, 'Testimonial not found'), { status: 404 });
    }

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

    const testimonial = await contentService.upsertTestimonial({ ...body, id });
    return NextResponse.json(successResponse(testimonial, 'Testimonial updated'));
  } catch (error) {
    console.error('PUT /api/admin/content/testimonials/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update testimonial'), { status: 500 });
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
    const id = Number(params.id);

    // P2-002: Check existence before deleting
    const existing = await contentService.getTestimonialById(id);
    if (!existing) {
      return NextResponse.json(errorResponse(404, 'Testimonial not found'), { status: 404 });
    }

    await contentService.deleteTestimonial(id);
    return NextResponse.json(successResponse(null, 'Testimonial deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/content/testimonials/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete testimonial'), { status: 500 });
  }
}
