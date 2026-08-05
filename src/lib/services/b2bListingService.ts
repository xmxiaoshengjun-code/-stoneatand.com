import { prisma } from '@/lib/prisma';

/**
 * B2BListing Service - manages B2B platform listing records and content generation.
 * Uses raw SQL because the B2BListing model cannot be regenerated
 * via prisma generate in the current sandbox environment.
 */

export interface B2BListingRow {
  id: number;
  productId: number;
  platformName: string;
  listingUrl: string | null;
  generatedContent: string | null;
  exportFormat: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface B2BListing {
  id: number;
  productId: number;
  platformName: string;
  listingUrl: string | null;
  generatedContent: string | null;
  exportFormat: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateB2BListingInput {
  productId: number;
  platformName: string;
}

export interface UpdateB2BListingInput {
  listingUrl?: string;
  status?: string;
  generatedContent?: string;
}

/** Converts a raw database row to a typed object. */
function toListing(row: B2BListingRow): B2BListing {
  return {
    id: row.id,
    productId: row.productId,
    platformName: row.platformName,
    listingUrl: row.listingUrl,
    generatedContent: row.generatedContent,
    exportFormat: row.exportFormat,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Product data needed for content generation. */
interface ProductForContent {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  standSize: string | null;
  panelSize: string | null;
  panelThickness: string | null;
  weight: string | null;
  material: string | null;
  features: string | null;
}

export class B2BListingService {
  /** Retrieves B2B listings, optionally filtered by productId, platform, or status. */
  async getAll(params?: {
    productId?: number;
    platform?: string;
    status?: string;
  }): Promise<B2BListing[]> {
    const conditions: string[] = [];
    const args: unknown[] = [];

    if (params?.productId) {
      conditions.push('productId = ?');
      args.push(params.productId);
    }
    if (params?.platform && params.platform !== 'all') {
      conditions.push('platformName = ?');
      args.push(params.platform);
    }
    if (params?.status && params.status !== 'all') {
      conditions.push('status = ?');
      args.push(params.status);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT id, productId, platformName, listingUrl, generatedContent, exportFormat, status, createdAt, updatedAt FROM B2BListing ${whereClause} ORDER BY id DESC`;

    const rows = await prisma.$queryRawUnsafe<B2BListingRow[]>(sql, ...args);
    return rows.map(toListing);
  }

  /** Retrieves a single B2B listing by ID. */
  async getById(id: number): Promise<B2BListing | null> {
    const rows = await prisma.$queryRawUnsafe<B2BListingRow[]>(
      'SELECT id, productId, platformName, listingUrl, generatedContent, exportFormat, status, createdAt, updatedAt FROM B2BListing WHERE id = ?',
      id
    );
    return rows.length > 0 ? toListing(rows[0]) : null;
  }

  /**
   * Generates B2B product description content based on platform template,
   * creates a new B2BListing record with status 'draft'.
   */
  async generateContent(
    productId: number,
    platformName: string
  ): Promise<B2BListing> {
    // Fetch product data using Prisma client (existing model)
    const products = await prisma.$queryRawUnsafe<ProductForContent[]>(
      `SELECT p.id, p.sku, p.name, p.description, p.standSize, p.panelSize, p.panelThickness, p.weight, p.material, p.features,
              s.name as seriesName
       FROM Product p
       LEFT JOIN Series s ON p.seriesId = s.id
       WHERE p.id = ?`,
      productId
    );

    if (products.length === 0) {
      throw new Error('Product not found');
    }

    const product = products[0];
    const content = this.buildContent(product, platformName);

    const now = new Date().toISOString();
    await prisma.$executeRawUnsafe(
      `INSERT INTO B2BListing (productId, platformName, generatedContent, exportFormat, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      productId,
      platformName,
      content,
      'text',
      'draft',
      now,
      now
    );

    const rows = await prisma.$queryRawUnsafe<B2BListingRow[]>(
      'SELECT id, productId, platformName, listingUrl, generatedContent, exportFormat, status, createdAt, updatedAt FROM B2BListing ORDER BY id DESC LIMIT 1'
    );
    return toListing(rows[0]);
  }

  /** Updates an existing B2B listing. */
  async update(id: number, data: UpdateB2BListingInput): Promise<B2BListing | null> {
    const now = new Date().toISOString();
    if (data.listingUrl !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE B2BListing SET listingUrl = ?, updatedAt = ? WHERE id = ?',
        data.listingUrl || null,
        now,
        id
      );
    }
    if (data.status !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE B2BListing SET status = ?, updatedAt = ? WHERE id = ?',
        data.status,
        now,
        id
      );
    }
    if (data.generatedContent !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE B2BListing SET generatedContent = ?, updatedAt = ? WHERE id = ?',
        data.generatedContent,
        now,
        id
      );
    }
    return this.getById(id);
  }

  /** Deletes a B2B listing by ID. */
  async delete(id: number): Promise<void> {
    await prisma.$executeRawUnsafe('DELETE FROM B2BListing WHERE id = ?', id);
  }

  /**
   * Builds platform-specific product description content from product data.
   * Uses different field ordering and formatting per platform.
   */
  private buildContent(
    product: ProductForContent & { seriesName?: string },
    platform: string
  ): string {
    const seriesName = (product as ProductForContent & { seriesName?: string }).seriesName || 'N/A';

    if (platform === 'alibaba') {
      return `Product Title: ${product.name}
SKU: ${product.sku}
Category: ${seriesName}

Key Specifications:
- Stand Size: ${product.standSize || 'N/A'}
- Panel Size: ${product.panelSize || 'N/A'}
- Panel Thickness: ${product.panelThickness || 'N/A'}
- Material: ${product.material || 'N/A'}
- Weight: ${product.weight || 'N/A'}

Description:
${product.description || 'N/A'}

Features:
${product.features || 'N/A'}

Company: Tsianfan (Xiamen) Industry & Trade Co., Ltd.
Contact: web@tsianfan.com | +86 13365904989`;
    }

    if (platform === 'made-in-china') {
      return `Product Name: ${product.name}
Model Number: ${product.sku}
Product Category: ${seriesName}

Specifications:
- Material: ${product.material || 'N/A'}
- Panel Size: ${product.panelSize || 'N/A'}
- Panel Thickness: ${product.panelThickness || 'N/A'}
- Stand Size: ${product.standSize || 'N/A'}
- Net Weight: ${product.weight || 'N/A'}

Product Description:
${product.description || 'N/A'}

Key Features:
${product.features || 'N/A'}

Supplier: Tsianfan (Xiamen) Industry & Trade Co., Ltd.
Email: web@tsianfan.com
Phone: +86 13365904989`;
    }

    if (platform === 'global-sources') {
      return `Product: ${product.name}
Item No.: ${product.sku}
Category: ${seriesName}

Product Details:
- Material: ${product.material || 'N/A'}
- Dimensions: ${product.standSize || 'N/A'}
- Panel Size: ${product.panelSize || 'N/A'}
- Thickness: ${product.panelThickness || 'N/A'}
- Weight: ${product.weight || 'N/A'}

Overview:
${product.description || 'N/A'}

Features & Advantages:
${product.features || 'N/A'}

Manufacturer: Tsianfan (Xiamen) Industry & Trade Co., Ltd.
Inquiries: web@tsianfan.com | +86 13365904989`;
    }

    // Custom / default template
    return `Product: ${product.name}
SKU: ${product.sku}
Category: ${seriesName}

Specifications:
- Stand Size: ${product.standSize || 'N/A'}
- Panel Size: ${product.panelSize || 'N/A'}
- Panel Thickness: ${product.panelThickness || 'N/A'}
- Material: ${product.material || 'N/A'}
- Weight: ${product.weight || 'N/A'}

Description:
${product.description || 'N/A'}

Features:
${product.features || 'N/A'}

Company: Tsianfan (Xiamen) Industry & Trade Co., Ltd.
Contact: web@tsianfan.com | +86 13365904989`;
  }
}

export const b2bListingService = new B2BListingService();
