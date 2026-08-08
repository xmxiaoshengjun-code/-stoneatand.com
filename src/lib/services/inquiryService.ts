import { prisma } from '@/lib/prisma';
import { generateInquiryNo, safeJsonParse } from '@/lib/utils';
import type { Inquiry, InquiryListResponse, InquiryStatus } from '@/types/inquiry';
import type { Attachment } from '@/types/attachment';

/**
 * Inquiry Service - handles all inquiry (RFQ) database operations.
 * Includes inquiry creation with automatic inquiry number generation
 * and customer deduplication by email.
 */
export class InquiryService {
  /**
   * Creates a new inquiry from the website contact form.
   * Auto-generates inquiry number and upserts customer record.
   * Stores attachments as a JSON string in the `attachments` column.
   */
  async createInquiry(data: {
    customerName: string;
    email: string;
    phone?: string;
    company?: string;
    country?: string;
    productId?: number;
    productSku?: string;
    quantity?: number;
    message: string;
    source?: string;
    attachments?: Attachment[];
  }): Promise<Inquiry> {
    // Upsert customer by email
    const customer = await prisma.customer.upsert({
      where: { email: data.email },
      update: {
        name: data.customerName,
        phone: data.phone || undefined,
        company: data.company || undefined,
        country: data.country || undefined,
      },
      create: {
        name: data.customerName,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        country: data.country || null,
        tag: 'OTHER',
        status: 'LEAD',
      },
    });

    // Generate inquiry number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayCount = await prisma.inquiry.count({
      where: { createdAt: { gte: todayStart } },
    });
    const inquiryNo = generateInquiryNo(todayCount + 1);

    const inquiry = await prisma.inquiry.create({
      data: {
        inquiryNo,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        country: data.country || null,
        productId: data.productId || null,
        productSku: data.productSku || null,
        quantity: data.quantity || null,
        message: data.message,
        source: data.source || 'website',
        status: 'NEW',
        customerId: customer.id,
      },
      include: {
        product: true,
        customer: true,
      },
    });

    // Store attachments as JSON in the `attachments` column.
    // Since prisma generate is blocked, the Prisma client doesn't know about
    // this column, so we use $executeRawUnsafe to set it directly.
    if (data.attachments && data.attachments.length > 0) {
      const attachmentsJson = JSON.stringify(data.attachments);
      await prisma.$executeRawUnsafe(
        'UPDATE Inquiry SET attachments = ? WHERE id = ?',
        attachmentsJson,
        inquiry.id
      );
    }

    const result = inquiry as unknown as Inquiry;
    result.attachments = data.attachments && data.attachments.length > 0 ? data.attachments : [];
    return result;
  }

  /**
   * Fetches a paginated list of inquiries (admin).
   */
  async getInquiries(params: {
    status?: InquiryStatus;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }): Promise<InquiryListResponse> {
    const { status, keyword, page = 1, pageSize = 20 } = params;
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (keyword) {
      where.OR = [
        { inquiryNo: { contains: keyword } },
        { customerName: { contains: keyword } },
        { email: { contains: keyword } },
        { company: { contains: keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.inquiry.count({ where }),
    ]);

    // Fetch attachments for all items in this page via raw SQL.
    // Prisma client doesn't know about the `attachments` column, so we
    // fetch it separately and merge into the result objects.
    if (items.length > 0) {
      const ids = items.map((i: { id: number }) => i.id);
      const idList = ids.join(',');
      const rawResults = await prisma.$queryRawUnsafe<Array<{ id: number; attachments: string | null }>>(
        `SELECT id, attachments FROM Inquiry WHERE id IN (${idList})`
      );
      const attachmentsMap = new Map<number, Attachment[]>();
      for (const row of rawResults) {
        const parsed = safeJsonParse<Attachment[]>(row.attachments, []);
        attachmentsMap.set(row.id, parsed);
      }
      for (const item of items) {
        (item as Record<string, unknown>).attachments = attachmentsMap.get(item.id) || [];
      }
    }

    return {
      items: items as unknown as Inquiry[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Fetches a single inquiry by ID with all related data.
   * Parses the `attachments` JSON column into an array.
   */
  async getInquiryById(id: number): Promise<Inquiry | null> {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        product: { include: { series: true } },
        customer: true,
        followUps: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (inquiry) {
      // Fetch the `attachments` column via raw SQL since Prisma client
      // doesn't know about this column.
      const rawResults = await prisma.$queryRawUnsafe<Array<{ attachments: string | null }>>(
        'SELECT attachments FROM Inquiry WHERE id = ?',
        id
      );
      const attachmentsStr = rawResults[0]?.attachments ?? null;
      (inquiry as Record<string, unknown>).attachments = safeJsonParse<Attachment[]>(
        attachmentsStr,
        []
      );
    }

    return inquiry as unknown as Inquiry | null;
  }

  /**
   * Updates inquiry status (admin).
   */
  async updateInquiryStatus(id: number, status: InquiryStatus, assignedTo?: string): Promise<Inquiry> {
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status, assignedTo: assignedTo || undefined },
    });
    return inquiry as unknown as Inquiry;
  }

  /**
   * Deletes an inquiry by ID (admin).
   * Also deletes associated follow-ups to avoid orphaned records.
   * Returns true if the inquiry was deleted, false if not found.
   */
  async deleteInquiry(id: number): Promise<boolean> {
    // Check if inquiry exists first
    const existing = await prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return false;
    }

    // Delete associated follow-ups (they have a foreign key to Inquiry)
    await prisma.followUp.deleteMany({ where: { inquiryId: id } });

    // Delete the inquiry
    await prisma.inquiry.delete({ where: { id } });
    return true;
  }

  /**
   * Fetches dashboard statistics for the admin panel.
   */
  async getDashboardStats(): Promise<{
    total: number;
    newCount: number;
    contactedCount: number;
    wonCount: number;
    lostCount: number;
    recentInquiries: Inquiry[];
  }> {
    const [total, newCount, contactedCount, wonCount, lostCount, recentInquiries] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } }),
      prisma.inquiry.count({ where: { status: 'CONTACTED' } }),
      prisma.inquiry.count({ where: { status: 'WON' } }),
      prisma.inquiry.count({ where: { status: 'LOST' } }),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { product: true },
      }),
    ]);

    return {
      total,
      newCount,
      contactedCount,
      wonCount,
      lostCount,
      recentInquiries: recentInquiries as unknown as Inquiry[],
    };
  }
}

export const inquiryService = new InquiryService();
