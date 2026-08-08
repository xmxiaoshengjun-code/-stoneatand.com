import { prisma } from '@/lib/prisma';
import { categoryService } from '@/lib/services/categoryService';
import { parseDimensionRange, parseThickness } from '@/lib/utils';
import type { Prisma } from '@prisma/client';
import type { Product, ProductListResponse, ProductFilterParams, SpecFinderResult, SpecFinderParams } from '@/types/product';

/**
 * Product Service - handles all product-related database operations.
 * API Routes must use this service layer instead of calling Prisma directly.
 */
export class ProductService {
  /**
   * Fetches a paginated, filtered list of products.
   * By default only published products are returned. Set `includeUnpublished`
   * to true in params to include unpublished (soft-deleted) products (admin).
   */
  async getProducts(params: ProductFilterParams): Promise<ProductListResponse> {
    const {
      series,
      panelSize,
      panelThickness,
      keyword,
      isFeatured,
      page = 1,
      pageSize = 12,
      sort = 'sortOrder',
      includeUnpublished = false,
    } = params;

    const where: Record<string, unknown> = {};

    // Only apply the isPublished filter when unpublished products are not requested.
    if (!includeUnpublished) {
      where.isPublished = true;
    }

    if (series) {
      // Look up the series by slug to determine if it's a parent or leaf.
      const seriesRows = await prisma.$queryRawUnsafe<
        Array<{ id: bigint; parentId: number | null }>
      >('SELECT id, parentId FROM Series WHERE slug = ?', series);

      if (seriesRows.length > 0) {
        const sid = Number(seriesRows[0].id);

        // Check if this series has children (i.e., it's a parent category).
        const childRows = await prisma.$queryRawUnsafe<Array<{ id: bigint }>>(
          'SELECT id FROM Series WHERE parentId = ?',
          sid
        );

        if (childRows.length > 0) {
          // Parent category — get all descendant IDs (including self) and filter by seriesId.
          const allIds = await categoryService.getDescendantIds(sid);
          where.seriesId = { in: allIds };
          // Remove any stale series relation filter to avoid conflict.
          delete where.series;
        } else {
          // Leaf series — filter by slug relation.
          where.series = { slug: series };
        }
      } else {
        // Slug not found — fall back to exact slug match (returns 0 results).
        where.series = { slug: series };
      }
    }
    if (panelSize) {
      where.panelSize = { contains: panelSize };
    }
    if (panelThickness) {
      where.panelThickness = { contains: panelThickness };
    }
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { sku: { contains: keyword } },
        { description: { contains: keyword } },
        { features: { contains: keyword } },
      ];
    }

    const orderBy: Record<string, string> = {};
    switch (sort) {
      case 'sku':
        orderBy.sku = 'asc';
        break;
      case 'name':
        orderBy.name = 'asc';
        break;
      case 'newest':
        orderBy.createdAt = 'desc';
        break;
      case 'featured':
        orderBy.isFeatured = 'desc';
        break;
      default:
        orderBy.sortOrder = 'asc';
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          series: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: items as unknown as Product[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Returns the total count of published products.
   */
  async getProductCount(): Promise<number> {
    return prisma.product.count({ where: { isPublished: true } });
  }

  /**
   * Fetches a single product by SKU (case-insensitive).
   * SKU values in the DB are uppercase (e.g. "SG601"), but URLs use lowercase.
   * We normalize the input to uppercase before querying to avoid 404s.
   */
  async getProductBySku(sku: string): Promise<Product | null> {
    const normalizedSku = sku.toUpperCase();
    const product = await prisma.product.findFirst({
      where: {
        sku: { equals: normalizedSku },
        isPublished: true,
      },
      include: {
        series: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return product as unknown as Product | null;
  }

  /**
   * Fetches a product by ID (for admin).
   */
  async getProductById(id: number): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        series: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return product as unknown as Product | null;
  }

  /**
   * Fetches related products from the same series.
   */
  async getRelatedProducts(productId: number, seriesId: number, limit = 4): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        seriesId,
        id: { not: productId },
        isPublished: true,
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
      take: limit,
      orderBy: { sortOrder: 'asc' },
    });
    return products as unknown as Product[];
  }

  /**
   * Fetches featured products for the homepage.
   */
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isPublished: true,
      },
      include: {
        series: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      take: limit,
      orderBy: { sortOrder: 'asc' },
    });
    return products as unknown as Product[];
  }

  /**
   * Fetches products by SKU list (for compare feature).
   * Normalizes all SKUs to uppercase to match DB storage.
   */
  async getProductsBySkus(skus: string[]): Promise<Product[]> {
    if (skus.length === 0) return [];
    const normalizedSkus = skus.map((s) => s.toUpperCase());
    const products = await prisma.product.findMany({
      where: {
        sku: { in: normalizedSkus },
        isPublished: true,
      },
      include: {
        series: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return products as unknown as Product[];
  }

  /**
   * Finds products matching the given tile specifications.
   * Used by the Spec Finder feature.
   */
  async findProductsBySpec(params: SpecFinderParams): Promise<SpecFinderResult[]> {
    const allProducts = await prisma.product.findMany({
      where: { isPublished: true },
      include: {
        series: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    const results: SpecFinderResult[] = [];

    for (const product of allProducts) {
      const matchScore: number = 0;
      const matchReasons: string[] = [];

      // Check panel size compatibility
      if (product.panelSize) {
        const dimRange = parseDimensionRange(product.panelSize);
        if (dimRange) {
          const { minW, maxW, minH, maxH } = dimRange;
          const tileW = Math.min(params.tileWidth, params.tileHeight);
          const tileH = Math.max(params.tileWidth, params.tileHeight);

          if (tileW >= minW && tileW <= maxW && tileH >= minH && tileH <= maxH) {
            matchReasons.push(`Panel size ${product.panelSize} accommodates ${params.tileWidth}×${params.tileHeight}mm tiles`);
          }
        }
      }

      // Check thickness compatibility
      if (product.panelThickness && params.tileThickness) {
        const thicknesses = parseThickness(product.panelThickness);
        if (thicknesses.length > 0) {
          const minT = Math.min(...thicknesses);
          const maxT = Math.max(...thicknesses);
          if (params.tileThickness >= minT && params.tileThickness <= maxT) {
            matchReasons.push(`Thickness range ${product.panelThickness} supports ${params.tileThickness}mm`);
          }
        }
      }

      if (matchReasons.length > 0) {
        results.push({
          product: product as unknown as Product,
          matchScore: matchReasons.length,
          matchReasons,
        });
      }
    }

    // Sort by match score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    return results;
  }

  /**
   * Creates a new product (admin only).
   */
  async createProduct(data: Record<string, unknown>): Promise<Product> {
    const input = data as Prisma.ProductCreateInput;
    const product = await prisma.product.create({ data: input });
    return product as unknown as Product;
  }

  /**
   * Updates an existing product (admin only).
   */
  async updateProduct(id: number, data: Record<string, unknown>): Promise<Product> {
    const input = data as Prisma.ProductUpdateInput;
    const product = await prisma.product.update({
      where: { id },
      data: input,
    });
    return product as unknown as Product;
  }

  /**
   * Soft-deletes a product by unpublishing it.
   */
  async deleteProduct(id: number): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  /**
   * Permanently deletes a product from the database.
   * Only allowed if the product is already unpublished (soft-deleted).
   * @throws Error if the product is still published.
   */
  async hardDeleteProduct(id: number): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { isPublished: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.isPublished) {
      throw new Error('Cannot hard-delete a published product. Unpublish it first.');
    }

    // Delete related images first to avoid foreign key constraint issues.
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
  }
}

export const productService = new ProductService();
