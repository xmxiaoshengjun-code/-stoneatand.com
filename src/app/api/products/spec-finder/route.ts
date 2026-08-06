import { NextRequest, NextResponse } from 'next/server';
import { specFinderService } from '@/lib/services/specFinderService';
import { specFinderSchema } from '@/lib/validations/product';
import { successResponse, errorResponse } from '@/types/api';

/**
 * GET /api/products/spec-finder - Returns preset thickness options and size presets
 * for server-side rendering or initial client hydration.
 */
export async function GET() {
  try {
    const thicknessOptions = specFinderService.getThicknessOptions();
    const sizePresets = specFinderService.getSizePresets();
    return NextResponse.json(
      successResponse({ thicknessOptions, sizePresets }, 'Spec finder options')
    );
  } catch (error) {
    console.error('GET /api/products/spec-finder error:', error);
    return NextResponse.json(
      errorResponse(500, 'Failed to fetch spec finder options'),
      { status: 500 }
    );
  }
}

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

    if (results.length === 0) {
      return NextResponse.json(
        successResponse(results, 'No matching products found for the given specifications')
      );
    }

    return NextResponse.json(successResponse(results, `Found ${results.length} matching product(s)`));
  } catch (error) {
    console.error('POST /api/products/spec-finder error:', error);
    const message = error instanceof Error ? error.message : 'Failed to find matching products';
    return NextResponse.json(
      errorResponse(500, message),
      { status: 500 }
    );
  }
}
