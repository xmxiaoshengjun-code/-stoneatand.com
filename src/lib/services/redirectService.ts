import { prisma } from '@/lib/prisma';

/**
 * Redirect Service - manages 301 redirect rules.
 * Uses raw SQL because the Redirect model cannot be regenerated
 * via prisma generate in the current sandbox environment.
 */

export interface RedirectRow {
  id: number;
  sourceUrl: string;
  targetUrl: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface Redirect {
  id: number;
  sourceUrl: string;
  targetUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRedirectInput {
  sourceUrl: string;
  targetUrl: string;
  isActive?: boolean;
}

export interface UpdateRedirectInput {
  sourceUrl?: string;
  targetUrl?: string;
  isActive?: boolean;
}

/** Converts a raw database row (0/1 integers) to a typed object. */
function toRedirect(row: RedirectRow): Redirect {
  return {
    id: row.id,
    sourceUrl: row.sourceUrl,
    targetUrl: row.targetUrl,
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class RedirectService {
  /** Retrieves all redirect rules. */
  async getAll(): Promise<Redirect[]> {
    const rows = await prisma.$queryRawUnsafe<RedirectRow[]>(
      'SELECT id, sourceUrl, targetUrl, isActive, createdAt, updatedAt FROM Redirect ORDER BY id ASC'
    );
    return rows.map(toRedirect);
  }

  /** Retrieves a single redirect by ID. */
  async getById(id: number): Promise<Redirect | null> {
    const rows = await prisma.$queryRawUnsafe<RedirectRow[]>(
      'SELECT id, sourceUrl, targetUrl, isActive, createdAt, updatedAt FROM Redirect WHERE id = ?',
      id
    );
    return rows.length > 0 ? toRedirect(rows[0]) : null;
  }

  /** Creates a new redirect rule. */
  async create(data: CreateRedirectInput): Promise<Redirect> {
    const now = new Date().toISOString();
    await prisma.$executeRawUnsafe(
      `INSERT INTO Redirect (sourceUrl, targetUrl, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?)`,
      data.sourceUrl,
      data.targetUrl,
      data.isActive === false ? 0 : 1,
      now,
      now
    );
    const rows = await prisma.$queryRawUnsafe<RedirectRow[]>(
      'SELECT id, sourceUrl, targetUrl, isActive, createdAt, updatedAt FROM Redirect ORDER BY id DESC LIMIT 1'
    );
    return toRedirect(rows[0]);
  }

  /** Updates an existing redirect rule. */
  async update(id: number, data: UpdateRedirectInput): Promise<Redirect | null> {
    const now = new Date().toISOString();
    if (data.sourceUrl !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE Redirect SET sourceUrl = ?, updatedAt = ? WHERE id = ?',
        data.sourceUrl,
        now,
        id
      );
    }
    if (data.targetUrl !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE Redirect SET targetUrl = ?, updatedAt = ? WHERE id = ?',
        data.targetUrl,
        now,
        id
      );
    }
    if (data.isActive !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE Redirect SET isActive = ?, updatedAt = ? WHERE id = ?',
        data.isActive ? 1 : 0,
        now,
        id
      );
    }
    return this.getById(id);
  }

  /** Deletes a redirect rule by ID. */
  async delete(id: number): Promise<void> {
    await prisma.$executeRawUnsafe('DELETE FROM Redirect WHERE id = ?', id);
  }

  /** Retrieves all active redirect rules for middleware matching. */
  async getActiveRedirects(): Promise<Redirect[]> {
    const rows = await prisma.$queryRawUnsafe<RedirectRow[]>(
      'SELECT id, sourceUrl, targetUrl, isActive, createdAt, updatedAt FROM Redirect WHERE isActive = 1 ORDER BY id ASC'
    );
    return rows.map(toRedirect);
  }
}

export const redirectService = new RedirectService();
