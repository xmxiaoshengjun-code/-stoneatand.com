import { NextRequest, NextResponse } from 'next/server';
import { specFinderService } from '@/lib/services/specFinderService';
import { specFinderSchema } from '@/lib/validations/product';
import { successResponse, errorResponse } from '@/types/api';

/**
 * POST /api/products/spec-finder - Finds products matching tile specifications.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = specFinderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(400, 'Invalid input', parsed.error.flatten().fieldErrors as Record<string, string[]>),
        { status: 400 }
      );
    }

    const results = await specFinderService.findMatches(parsed.data);
    return NextResponse.json(successResponse(results));
  } catch (error) {
    console.error('POST /api/products/spec-finder error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to find matching products'), { status: 500 });
  }
}
