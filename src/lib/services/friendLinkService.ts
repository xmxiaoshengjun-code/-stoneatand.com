import { prisma } from '@/lib/prisma';

/**
 * FriendLink Service - manages friend links.
 * Uses raw SQL because the FriendLink model cannot be regenerated
 * via prisma generate in the current sandbox environment.
 */

export interface FriendLinkRow {
  id: number;
  name: string;
  url: string;
  logo: string | null;
  sortOrder: number;
  isVisible: number;
  createdAt: string;
  updatedAt: string;
}

export interface FriendLink {
  id: number;
  name: string;
  url: string;
  logo: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFriendLinkInput {
  name: string;
  url: string;
  logo?: string;
  sortOrder?: number;
  isVisible?: boolean;
}

export interface UpdateFriendLinkInput {
  name?: string;
  url?: string;
  logo?: string;
  sortOrder?: number;
  isVisible?: boolean;
}

/** Converts a raw database row (0/1 integers) to a typed object. */
function toFriendLink(row: FriendLinkRow): FriendLink {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    logo: row.logo,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class FriendLinkService {
  /** Retrieves all friend links ordered by sortOrder. */
  async getAll(): Promise<FriendLink[]> {
    const rows = await prisma.$queryRawUnsafe<FriendLinkRow[]>(
      'SELECT id, name, url, logo, sortOrder, isVisible, createdAt, updatedAt FROM FriendLink ORDER BY sortOrder ASC, id ASC'
    );
    return rows.map(toFriendLink);
  }

  /** Retrieves a single friend link by ID. */
  async getById(id: number): Promise<FriendLink | null> {
    const rows = await prisma.$queryRawUnsafe<FriendLinkRow[]>(
      'SELECT id, name, url, logo, sortOrder, isVisible, createdAt, updatedAt FROM FriendLink WHERE id = ?',
      id
    );
    return rows.length > 0 ? toFriendLink(rows[0]) : null;
  }

  /** Creates a new friend link. */
  async create(data: CreateFriendLinkInput): Promise<FriendLink> {
    const now = new Date().toISOString();
    await prisma.$executeRawUnsafe(
      `INSERT INTO FriendLink (name, url, logo, sortOrder, isVisible, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      data.name,
      data.url,
      data.logo || null,
      data.sortOrder ?? 0,
      data.isVisible === false ? 0 : 1,
      now,
      now
    );
    const rows = await prisma.$queryRawUnsafe<FriendLinkRow[]>(
      'SELECT id, name, url, logo, sortOrder, isVisible, createdAt, updatedAt FROM FriendLink ORDER BY id DESC LIMIT 1'
    );
    return toFriendLink(rows[0]);
  }

  /** Updates an existing friend link. */
  async update(id: number, data: UpdateFriendLinkInput): Promise<FriendLink | null> {
    const now = new Date().toISOString();
    if (data.name !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE FriendLink SET name = ?, updatedAt = ? WHERE id = ?',
        data.name,
        now,
        id
      );
    }
    if (data.url !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE FriendLink SET url = ?, updatedAt = ? WHERE id = ?',
        data.url,
        now,
        id
      );
    }
    if (data.logo !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE FriendLink SET logo = ?, updatedAt = ? WHERE id = ?',
        data.logo || null,
        now,
        id
      );
    }
    if (data.sortOrder !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE FriendLink SET sortOrder = ?, updatedAt = ? WHERE id = ?',
        data.sortOrder,
        now,
        id
      );
    }
    if (data.isVisible !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE FriendLink SET isVisible = ?, updatedAt = ? WHERE id = ?',
        data.isVisible ? 1 : 0,
        now,
        id
      );
    }
    return this.getById(id);
  }

  /** Deletes a friend link by ID. */
  async delete(id: number): Promise<void> {
    await prisma.$executeRawUnsafe('DELETE FROM FriendLink WHERE id = ?', id);
  }
}

export const friendLinkService = new FriendLinkService();
