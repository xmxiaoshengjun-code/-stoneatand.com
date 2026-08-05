import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/customerService';
import { customerUpdateSchema } from '@/lib/validations/inquiry';
import { successResponse, errorResponse } from '@/types/api';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/customers/[id] - Fetch customer with full history.
 * PATCH /api/admin/customers/[id] - Update customer info.
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
      return NextResponse.json(errorResponse(400, 'Invalid customer ID'), { status: 400 });
    }

    const customer = await customerService.getCustomerById(id);
    if (!customer) {
      return NextResponse.json(errorResponse(404, 'Customer not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(customer));
  } catch (error) {
    console.error('GET /api/admin/customers/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to fetch customer'), { status: 500 });
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
      return NextResponse.json(errorResponse(400, 'Invalid customer ID'), { status: 400 });
    }

    const body = await request.json();
    const parsed = customerUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(400, 'Invalid input', parsed.error.flatten().fieldErrors as Record<string, string[]>),
        { status: 400 }
      );
    }

    const customer = await customerService.updateCustomer(id, parsed.data);
    return NextResponse.json(successResponse(customer, 'Customer updated'));
  } catch (error) {
    console.error('PATCH /api/admin/customers/[id] error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to update customer'), { status: 500 });
  }
}
