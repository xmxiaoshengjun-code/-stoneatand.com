import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * Project Service - manages project/case study showcase.
 */
export class ProjectService {
  /**
   * Fetches published projects for the public projects page.
   */
  async getProjects(limit = 20) {
    return prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });
  }

  /**
   * Fetches a single published project by slug.
   */
  async getProjectBySlug(slug: string) {
    return prisma.project.findFirst({
      where: { slug, isPublished: true },
    });
  }

  /**
   * Fetches a project by ID (admin).
   */
  async getProjectById(id: number) {
    return prisma.project.findUnique({ where: { id } });
  }

  /**
   * Creates a new project (admin).
   */
  async createProject(data: Record<string, unknown>) {
    const input = data as Prisma.ProjectCreateInput;
    return prisma.project.create({ data: input });
  }

  /**
   * Updates a project (admin).
   */
  async updateProject(id: number, data: Record<string, unknown>) {
    const input = data as Prisma.ProjectUpdateInput;
    return prisma.project.update({ where: { id }, data: input });
  }

  /**
   * Deletes a project (admin).
   */
  async deleteProject(id: number) {
    return prisma.project.delete({ where: { id } });
  }

  /**
   * Fetches all projects for admin (including unpublished).
   */
  async getAllProjects(params: { page?: number; pageSize?: number; keyword?: string }) {
    const { page = 1, pageSize = 20, keyword } = params;
    const where: Prisma.ProjectWhereInput = {};
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { location: { contains: keyword } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}

export const projectService = new ProjectService();
