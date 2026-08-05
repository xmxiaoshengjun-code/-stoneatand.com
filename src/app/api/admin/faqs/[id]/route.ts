import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/faqs/[id] - Fetch a single FAQ by ID.
 * PUT /api/admin/faqs/[id] - Update a FAQ.
 * DELETE /api/admin/faqs/[id] - Delete a FAQ.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = Number(params.id);
    const faq = await prisma.fAQ.findUnique({ where: { id } });

    if (!faq) {
      return NextResponse.json(errorResponse(404, 'FAQ not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(faq));
  } catch (error) {
    console.error('GET /api/admin/faqs/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch FAQ'), { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { category, question, answer, keywords, sortOrder } = body;

    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(errorResponse(404, 'FAQ not found'), { status: 404 });
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        category: category ?? existing.category,
        question: question ?? existing.question,
        answer: answer ?? existing.answer,
        keywords: keywords !== undefined ? keywords : existing.keywords,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : existing.sortOrder,
      },
    });

    return NextResponse.json(successResponse(faq, 'FAQ updated'));
  } catch (error) {
    console.error('PUT /api/admin/faqs/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update FAQ'), { status: 500 });
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
    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(errorResponse(404, 'FAQ not found'), { status: 404 });
    }

    await prisma.fAQ.delete({ where: { id } });
    return NextResponse.json(successResponse(null, 'FAQ deleted'));
  } catch (error) {
    console.error('DELETE /api/admin/faqs/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to delete FAQ'), { status: 500 });
  }
}
