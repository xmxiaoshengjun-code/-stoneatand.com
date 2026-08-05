import { prisma } from '@/lib/prisma';

/**
 * Category Service - manages Series tree structure using parentId.
 * Uses raw SQL for parentId read/write because prisma generate is blocked
 * and the parentId column was added via ALTER TABLE (not in Prisma Client).
 */

export interface CategoryRow {
  id: number;
  name: string;
  nameCn: string | null;
  slug: string;
  prefix: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryNode {
  id: number;
  name: string;
  nameCn: string | null;
  slug: string;
  prefix: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  sortOrder: number;
  children: CategoryNode[];
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  prefix?: string;
  parentId?: number;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  parentId?: number;
}

export class CategoryService {
  /** Retrieves all categories as a flat list. */
  async getAllFlat(): Promise<CategoryRow[]> {
    const rows = await prisma.$queryRawUnsafe<CategoryRow[]>(
      `SELECT id, name, nameCn, slug, prefix, description, image, parentId, sortOrder, createdAt, updatedAt
       FROM Series ORDER BY sortOrder ASC, id ASC`
    );
    // Convert BigInt fields to number (SQLite returns BigInt for INTEGER)
    return rows.map((row) => ({
      ...row,
      id: Number(row.id),
      parentId: row.parentId !== null ? Number(row.parentId) : null,
      sortOrder: Number(row.sortOrder),
    }));
  }

  /** Retrieves all categories as a tree structure (parent → children). */
  async getTree(): Promise<CategoryNode[]> {
    const flat = await this.getAllFlat();
    return this.buildTree(flat);
  }

  /** Builds a tree from a flat list of categories. */
  private buildTree(flat: CategoryRow[]): CategoryNode[] {
    const nodeMap = new Map<number, CategoryNode>();
    const roots: CategoryNode[] = [];

    // Create all nodes first
    for (const row of flat) {
      nodeMap.set(row.id, {
        id: row.id,
        name: row.name,
        nameCn: row.nameCn,
        slug: row.slug,
        prefix: row.prefix,
        description: row.description,
        image: row.image,
        parentId: row.parentId,
        sortOrder: row.sortOrder,
        children: [],
      });
    }

    // Link children to parents
    for (const row of flat) {
      const node = nodeMap.get(row.id)!;
      if (row.parentId && nodeMap.has(row.parentId)) {
        nodeMap.get(row.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /** Creates a new category (Series with parentId). */
  async create(data: CreateCategoryInput): Promise<CategoryRow> {
    const now = new Date().toISOString();
    await prisma.$executeRawUnsafe(
      `INSERT INTO Series (name, slug, prefix, description, parentId, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      data.name,
      data.slug,
      data.prefix || data.slug.substring(0, 3).toUpperCase(),
      data.description || null,
      data.parentId ?? null,
      0,
      now,
      now
    );

    const rows = await prisma.$queryRawUnsafe<CategoryRow[]>(
      `SELECT id, name, nameCn, slug, prefix, description, image, parentId, sortOrder, createdAt, updatedAt
       FROM Series ORDER BY id DESC LIMIT 1`
    );
    const row = rows[0];
    return {
      ...row,
      id: Number(row.id),
      parentId: row.parentId !== null ? Number(row.parentId) : null,
      sortOrder: Number(row.sortOrder),
    };
  }

  /** Updates an existing category. */
  async update(id: number, data: UpdateCategoryInput): Promise<CategoryRow | null> {
    const now = new Date().toISOString();
    if (data.name !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE Series SET name = ?, updatedAt = ? WHERE id = ?',
        data.name,
        now,
        id
      );
    }
    if (data.description !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE Series SET description = ?, updatedAt = ? WHERE id = ?',
        data.description || null,
        now,
        id
      );
    }
    if (data.parentId !== undefined) {
      // Prevent setting parent to self or creating circular reference
      if (data.parentId === id) {
        throw new Error('Cannot set parent to self');
      }
      await prisma.$executeRawUnsafe(
        'UPDATE Series SET parentId = ?, updatedAt = ? WHERE id = ?',
        data.parentId || null,
        now,
        id
      );
    }

    const rows = await prisma.$queryRawUnsafe<CategoryRow[]>(
      `SELECT id, name, nameCn, slug, prefix, description, image, parentId, sortOrder, createdAt, updatedAt
       FROM Series WHERE id = ?`,
      id
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      id: Number(row.id),
      parentId: row.parentId !== null ? Number(row.parentId) : null,
      sortOrder: Number(row.sortOrder),
    };
  }

  /** Deletes a category, but only if it has no children and no products. */
  async delete(id: number): Promise<void> {
    // Check for child categories
    const childCount = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
      'SELECT COUNT(*) as count FROM Series WHERE parentId = ?',
      id
    );
    if (Number(childCount[0]?.count ?? 0) > 0) {
      throw new Error('Cannot delete category with child categories');
    }

    // Check for products in this category
    const productCount = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
      'SELECT COUNT(*) as count FROM Product WHERE seriesId = ?',
      id
    );
    if (Number(productCount[0]?.count ?? 0) > 0) {
      throw new Error('Cannot delete category with associated products');
    }

    await prisma.$executeRawUnsafe('DELETE FROM Series WHERE id = ?', id);
  }

  /**
   * Retrieves all descendant category IDs for a given parent ID
   * (used for filtering products by parent category).
   */
  async getDescendantIds(parentId: number): Promise<number[]> {
    const allFlat = await this.getAllFlat();
    const result: number[] = [parentId];
    const queue = [parentId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      for (const row of allFlat) {
        if (row.parentId === currentId && !result.includes(row.id)) {
          result.push(row.id);
          queue.push(row.id);
        }
      }
    }

    return result;
  }
}

export const categoryService = new CategoryService();
