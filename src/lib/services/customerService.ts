import { prisma } from '@/lib/prisma';
import type { Customer, CustomerListResponse, CustomerTag, CustomerStatus } from '@/types/inquiry';

/**
 * Customer Service - handles customer CRUD operations for CRM.
 */
export class CustomerService {
  /**
   * Fetches a paginated list of customers.
   */
  async getCustomers(params: {
    keyword?: string;
    status?: CustomerStatus;
    tag?: CustomerTag;
    page?: number;
    pageSize?: number;
  }): Promise<CustomerListResponse> {
    const { keyword, status, tag, page = 1, pageSize = 20 } = params;
    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (tag) where.tag = tag;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { email: { contains: keyword } },
        { company: { contains: keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          inquiries: { select: { id: true, inquiryNo: true, status: true, createdAt: true }, take: 5, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      items: items as unknown as Customer[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Fetches a single customer by ID with full inquiry history.
   */
  async getCustomerById(id: number): Promise<Customer | null> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        inquiries: { orderBy: { createdAt: 'desc' } },
        followUps: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    return customer as unknown as Customer | null;
  }

  /**
   * Updates a customer record.
   */
  async updateCustomer(id: number, data: Record<string, unknown>): Promise<Customer> {
    const customer = await prisma.customer.update({
      where: { id },
      data,
    });
    return customer as unknown as Customer;
  }

  /**
   * Creates a follow-up record for a customer or inquiry.
   */
  async createFollowUp(data: {
    customerId?: number;
    inquiryId?: number;
    type: string;
    content: string;
    nextFollowUpDate?: string;
    createdBy?: string;
  }) {
    return prisma.followUp.create({ data });
  }
}

export const customerService = new CustomerService();
