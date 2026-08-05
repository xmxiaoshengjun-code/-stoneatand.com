import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/faqs - List FAQs with optional category filter and pagination.
 * POST /api/admin/faqs - Create a new FAQ.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 50;

    const where = category ? { category } : {};
    const [items, total] = await Promise.all([
      prisma.fAQ.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.fAQ.count({ where }),
    ]);

    return NextResponse.json(successResponse({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }));
  } catch (error) {
    console.error('GET /api/admin/faqs error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch FAQs'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { category, question, answer, keywords, sortOrder } = body;

    if (!category || !question || !answer) {
      return NextResponse.json(
        errorResponse(400, 'category, question, and answer are required'),
        { status: 400 }
      );
    }

    const faq = await prisma.fAQ.create({
      data: {
        category,
        question,
        answer,
        keywords: keywords || null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    });

    return NextResponse.json(successResponse(faq, 'FAQ created'), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/faqs error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to create FAQ'), { status: 500 });
  }
}
