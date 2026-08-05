import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * Content Service - manages CMS content (banners, pages, testimonials, FAQs).
 */
export class ContentService {
  /**
   * Fetches all published banners for the homepage hero.
   */
  async getBanners() {
    return prisma.banner.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Fetches all banners (including unpublished) for admin management.
   */
  async getAllBanners() {
    return prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Fetches a banner by ID.
   */
  async getBannerById(id: number) {
    return prisma.banner.findUnique({ where: { id } });
  }

  /**
   * Fetches a content page by slug.
   */
  async getContentPage(slug: string) {
    return prisma.contentPage.findUnique({ where: { slug } });
  }

  /**
   * Fetches all content pages for admin management.
   */
  async getAllContentPages() {
    return prisma.contentPage.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Fetches a content page by ID.
   */
  async getContentPageById(id: number) {
    return prisma.contentPage.findUnique({ where: { id } });
  }

  /**
   * Fetches published testimonials for the homepage.
   */
  async getTestimonials(limit = 10) {
    return prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });
  }

  /**
   * Fetches all testimonials for admin management.
   */
  async getAllTestimonials() {
    return prisma.testimonial.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Fetches a testimonial by ID.
   */
  async getTestimonialById(id: number) {
    return prisma.testimonial.findUnique({ where: { id } });
  }

  /**
   * Fetches FAQs by category.
   */
  async getFAQs(category?: string) {
    const where: Prisma.FAQWhereInput = {};
    if (category) where.category = category;
    return prisma.fAQ.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  /**
   * Creates or updates a banner (admin).
   */
  async upsertBanner(data: Record<string, unknown>) {
    const id = data.id as number | undefined;
    const input = data as Prisma.BannerCreateInput;
    if (id) {
      return prisma.banner.update({ where: { id }, data: input as Prisma.BannerUpdateInput });
    }
    return prisma.banner.create({ data: input });
  }

  /**
   * Deletes a banner by ID.
   */
  async deleteBanner(id: number) {
    return prisma.banner.delete({ where: { id } });
  }

  /**
   * Creates or updates a content page (admin).
   */
  async upsertContentPage(data: Record<string, unknown>) {
    const slug = data.slug as string;
    const input = data as Prisma.ContentPageCreateInput;
    return prisma.contentPage.upsert({
      where: { slug },
      update: input,
      create: input,
    });
  }

  /**
   * Updates a content page by ID.
   */
  async updateContentPage(id: number, data: Record<string, unknown>) {
    const input = data as Prisma.ContentPageUpdateInput;
    return prisma.contentPage.update({ where: { id }, data: input });
  }

  /**
   * Deletes a content page by ID.
   */
  async deleteContentPage(id: number) {
    return prisma.contentPage.delete({ where: { id } });
  }

  /**
   * Creates or updates a testimonial (admin).
   */
  async upsertTestimonial(data: Record<string, unknown>) {
    const id = data.id as number | undefined;
    const input = data as Prisma.TestimonialCreateInput;
    if (id) {
      return prisma.testimonial.update({ where: { id }, data: input as Prisma.TestimonialUpdateInput });
    }
    return prisma.testimonial.create({ data: input });
  }

  /**
   * Deletes a testimonial by ID.
   */
  async deleteTestimonial(id: number) {
    return prisma.testimonial.delete({ where: { id } });
  }

  /**
   * Fetches all regions.
   */
  async getRegions() {
    return prisma.region.findMany({ orderBy: { code: 'asc' } });
  }

  /**
   * Fetches a region by code.
   */
  async getRegionByCode(code: string) {
    return prisma.region.findUnique({ where: { code } });
  }
}

export const contentService = new ContentService();
