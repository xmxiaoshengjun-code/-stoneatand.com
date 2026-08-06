import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * Project data with parsed images array (used by public projects page and ProjectCard).
 */
export interface ProjectWithImages {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  projectDate: string | null;
  images: string[];
  isPublished: boolean;
}

/**
 * Parses the raw `images` field from the DB into a clean string array.
 *
 * The DB stores `images` as a `String?` column with inconsistent formats:
 *  - JSON array string:   `'["/img/a.jpg", "/img/b.jpg"]'`
 *  - JSON empty array:    `'[]'`
 *  - Single URL string:   `'/images/projects/xxx.jpg'`
 *  - null / empty string: `null` or `''`
 *
 * This function normalises all of the above into `string[]`.
 */
function parseProjectImages(imagesStr: string | null): string[] {
  if (!imagesStr || imagesStr.trim() === '') return [];
  try {
    const parsed = JSON.parse(imagesStr);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0);
    }
    if (typeof parsed === 'string' && parsed.length > 0) {
      return [parsed];
    }
  } catch {
    // Not valid JSON — treat the raw value as a single image URL.
    return [imagesStr];
  }
  return [];
}

/**
 * Project Service - manages project/case study showcase.
 */
export class ProjectService {
  /**
   * Fetches published projects for the public projects page.
   * Returns ProjectWithImages[] with the images field parsed into a string array.
   */
  async getProjects(limit = 20): Promise<ProjectWithImages[]> {
    const projects = await prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });

    return projects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      location: p.location,
      projectDate: p.projectDate ? p.projectDate.toISOString() : null,
      images: parseProjectImages(p.images),
      isPublished: p.isPublished,
    }));
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
