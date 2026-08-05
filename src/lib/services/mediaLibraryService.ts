import { prisma } from '@/lib/prisma';

/**
 * MediaLibrary Service - manages the unified image library.
 * Uses raw SQL because the MediaLibrary model cannot be regenerated
 * via prisma generate in the current sandbox environment.
 */

export interface MediaLibraryRow {
  id: number;
  filename: string;
  url: string;
  alt: string | null;
  category: string;
  fileSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  uploadedAt: string;
}

export interface MediaLibrary {
  id: number;
  filename: string;
  url: string;
  alt: string | null;
  category: string;
  fileSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  uploadedAt: string;
}

export interface UsageLocation {
  table: string;
  id: number;
  context: string;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Converts a raw database row to a typed object. */
function toMedia(row: MediaLibraryRow): MediaLibrary {
  return {
    id: Number(row.id),
    filename: row.filename,
    url: row.url,
    alt: row.alt,
    category: row.category,
    fileSize: Number(row.fileSize),
    mimeType: row.mimeType,
    width: row.width !== null ? Number(row.width) : null,
    height: row.height !== null ? Number(row.height) : null,
    uploadedAt: row.uploadedAt,
  };
}

export class MediaLibraryService {
  /** Retrieves a paginated list of media, optionally filtered by category. */
  async getAll(params?: {
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<MediaLibrary>> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 24;
    const offset = (page - 1) * pageSize;

    let rows: MediaLibraryRow[];
    let countRow: Array<{ total: number }>;

    if (params?.category && params.category !== 'all') {
      rows = await prisma.$queryRawUnsafe<MediaLibraryRow[]>(
        'SELECT id, filename, url, alt, category, fileSize, mimeType, width, height, uploadedAt FROM MediaLibrary WHERE category = ? ORDER BY uploadedAt DESC LIMIT ? OFFSET ?',
        params.category,
        pageSize,
        offset
      );
      countRow = await prisma.$queryRawUnsafe<Array<{ total: number }>>(
        'SELECT COUNT(*) as total FROM MediaLibrary WHERE category = ?',
        params.category
      );
    } else {
      rows = await prisma.$queryRawUnsafe<MediaLibraryRow[]>(
        'SELECT id, filename, url, alt, category, fileSize, mimeType, width, height, uploadedAt FROM MediaLibrary ORDER BY uploadedAt DESC LIMIT ? OFFSET ?',
        pageSize,
        offset
      );
      countRow = await prisma.$queryRawUnsafe<Array<{ total: number }>>(
        'SELECT COUNT(*) as total FROM MediaLibrary'
      );
    }

    const total = Number(countRow[0]?.total ?? 0);
    return {
      items: rows.map(toMedia),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** Retrieves a single media record by ID. */
  async getById(id: number): Promise<MediaLibrary | null> {
    const rows = await prisma.$queryRawUnsafe<MediaLibraryRow[]>(
      'SELECT id, filename, url, alt, category, fileSize, mimeType, width, height, uploadedAt FROM MediaLibrary WHERE id = ?',
      id
    );
    return rows.length > 0 ? toMedia(rows[0]) : null;
  }

  /** Registers a new media record after upload. */
  async register(data: {
    filename: string;
    url: string;
    alt?: string;
    category?: string;
    fileSize: number;
    mimeType: string;
    width?: number;
    height?: number;
  }): Promise<MediaLibrary> {
    await prisma.$executeRawUnsafe(
      `INSERT INTO MediaLibrary (filename, url, alt, category, fileSize, mimeType, width, height, uploadedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      data.filename,
      data.url,
      data.alt || null,
      data.category || 'general',
      data.fileSize,
      data.mimeType,
      data.width ?? null,
      data.height ?? null,
      new Date().toISOString()
    );
    const rows = await prisma.$queryRawUnsafe<MediaLibraryRow[]>(
      'SELECT id, filename, url, alt, category, fileSize, mimeType, width, height, uploadedAt FROM MediaLibrary ORDER BY id DESC LIMIT 1'
    );
    return toMedia(rows[0]);
  }

  /** Updates media metadata (alt text and category). */
  async update(
    id: number,
    data: { alt?: string; category?: string }
  ): Promise<MediaLibrary | null> {
    if (data.alt !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE MediaLibrary SET alt = ? WHERE id = ?',
        data.alt || null,
        id
      );
    }
    if (data.category !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE MediaLibrary SET category = ? WHERE id = ?',
        data.category,
        id
      );
    }
    return this.getById(id);
  }

  /** Deletes a media record by ID. */
  async delete(id: number): Promise<void> {
    await prisma.$executeRawUnsafe('DELETE FROM MediaLibrary WHERE id = ?', id);
  }

  /**
   * Finds all places where a media URL is used across the database.
   * Scans ProductImage, Banner, FriendLink, and Series tables.
   */
  async getUsageLocations(url: string): Promise<UsageLocation[]> {
    const locations: UsageLocation[] = [];

    // ProductImage table
    const productImages = await prisma.$queryRawUnsafe<Array<{ id: number; productId: number }>>(
      'SELECT id, productId FROM ProductImage WHERE url = ?',
      url
    );
    for (const img of productImages) {
      locations.push({
        table: 'ProductImage',
        id: Number(img.id),
        context: `Product image (productId: ${Number(img.productId)})`,
      });
    }

    // Banner table
    const banners = await prisma.$queryRawUnsafe<Array<{ id: number; title: string }>>(
      'SELECT id, title FROM Banner WHERE image = ?',
      url
    );
    for (const banner of banners) {
      locations.push({
        table: 'Banner',
        id: Number(banner.id),
        context: `Banner: ${banner.title}`,
      });
    }

    // FriendLink table
    const links = await prisma.$queryRawUnsafe<Array<{ id: number; name: string }>>(
      'SELECT id, name FROM FriendLink WHERE logo = ?',
      url
    );
    for (const link of links) {
      locations.push({
        table: 'FriendLink',
        id: Number(link.id),
        context: `Friend link: ${link.name}`,
      });
    }

    // Series table
    const series = await prisma.$queryRawUnsafe<Array<{ id: number; name: string }>>(
      'SELECT id, name FROM Series WHERE image = ?',
      url
    );
    for (const s of series) {
      locations.push({
        table: 'Series',
        id: Number(s.id),
        context: `Series: ${s.name}`,
      });
    }

    return locations;
  }
}

export const mediaLibraryService = new MediaLibraryService();
