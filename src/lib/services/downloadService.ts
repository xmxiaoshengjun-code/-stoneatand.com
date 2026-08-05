import { prisma } from '@/lib/prisma';

/**
 * Download Service - manages downloadable resources.
 * Uses raw SQL because the Download model cannot be regenerated
 * via prisma generate in the current sandbox environment.
 */

export interface DownloadRow {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  sortOrder: number;
  isPublished: number;
  createdAt: string;
  updatedAt: string;
}

export interface Download {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDownloadInput {
  title: string;
  description?: string;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category?: string;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface UpdateDownloadInput {
  title?: string;
  description?: string;
  category?: string;
  sortOrder?: number;
  isPublished?: boolean;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Converts a raw database row (0/1 integers) to a typed object. */
function toDownload(row: DownloadRow): Download {
  return {
    id: Number(row.id),
    title: row.title,
    description: row.description,
    filePath: row.filePath,
    fileName: row.fileName,
    fileType: row.fileType,
    fileSize: Number(row.fileSize),
    category: row.category,
    sortOrder: Number(row.sortOrder),
    isPublished: Number(row.isPublished) === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DownloadService {
  /** Retrieves a paginated list of downloads, optionally filtered by category. */
  async getAll(params?: {
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<Download>> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    let rows: DownloadRow[];
    let countRow: Array<{ total: number }>;

    if (params?.category && params.category !== 'all') {
      rows = await prisma.$queryRawUnsafe<DownloadRow[]>(
        'SELECT id, title, description, filePath, fileName, fileType, fileSize, category, sortOrder, isPublished, createdAt, updatedAt FROM Download WHERE category = ? ORDER BY sortOrder ASC, id DESC LIMIT ? OFFSET ?',
        params.category,
        pageSize,
        offset
      );
      countRow = await prisma.$queryRawUnsafe<Array<{ total: number }>>(
        'SELECT COUNT(*) as total FROM Download WHERE category = ?',
        params.category
      );
    } else {
      rows = await prisma.$queryRawUnsafe<DownloadRow[]>(
        'SELECT id, title, description, filePath, fileName, fileType, fileSize, category, sortOrder, isPublished, createdAt, updatedAt FROM Download ORDER BY sortOrder ASC, id DESC LIMIT ? OFFSET ?',
        pageSize,
        offset
      );
      countRow = await prisma.$queryRawUnsafe<Array<{ total: number }>>(
        'SELECT COUNT(*) as total FROM Download'
      );
    }

    const total = Number(countRow[0]?.total ?? 0);
    return {
      items: rows.map(toDownload),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** Retrieves a single download by ID. */
  async getById(id: number): Promise<Download | null> {
    const rows = await prisma.$queryRawUnsafe<DownloadRow[]>(
      'SELECT id, title, description, filePath, fileName, fileType, fileSize, category, sortOrder, isPublished, createdAt, updatedAt FROM Download WHERE id = ?',
      id
    );
    return rows.length > 0 ? toDownload(rows[0]) : null;
  }

  /** Creates a new download record. */
  async create(data: CreateDownloadInput): Promise<Download> {
    const now = new Date().toISOString();
    await prisma.$executeRawUnsafe(
      `INSERT INTO Download (title, description, filePath, fileName, fileType, fileSize, category, sortOrder, isPublished, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      data.title,
      data.description || null,
      data.filePath,
      data.fileName,
      data.fileType,
      data.fileSize,
      data.category || 'other',
      data.sortOrder ?? 0,
      data.isPublished === false ? 0 : 1,
      now,
      now
    );
    const rows = await prisma.$queryRawUnsafe<DownloadRow[]>(
      'SELECT id, title, description, filePath, fileName, fileType, fileSize, category, sortOrder, isPublished, createdAt, updatedAt FROM Download ORDER BY id DESC LIMIT 1'
    );
    return toDownload(rows[0]);
  }

  /** Updates an existing download record. */
  async update(id: number, data: UpdateDownloadInput): Promise<Download | null> {
    const now = new Date().toISOString();
    if (data.title !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE Download SET title = ?, updatedAt = ? WHERE id = ?',
        data.title,
        now,
        id
      );
    }
    if (data.description !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE Download SET description = ?, updatedAt = ? WHERE id = ?',
        data.description || null,
        now,
        id
      );
    }
    if (data.category !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE Download SET category = ?, updatedAt = ? WHERE id = ?',
        data.category,
        now,
        id
      );
    }
    if (data.sortOrder !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE Download SET sortOrder = ?, updatedAt = ? WHERE id = ?',
        data.sortOrder,
        now,
        id
      );
    }
    if (data.isPublished !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE Download SET isPublished = ?, updatedAt = ? WHERE id = ?',
        data.isPublished ? 1 : 0,
        now,
        id
      );
    }
    return this.getById(id);
  }

  /** Deletes a download record by ID. */
  async delete(id: number): Promise<void> {
    await prisma.$executeRawUnsafe('DELETE FROM Download WHERE id = ?', id);
  }
}

export const downloadService = new DownloadService();
