import { prisma } from '@/lib/prisma';
import type { ChatResponse } from '@/types/chat';
import { parseDimensionRange, parseThickness } from '@/lib/utils';

/**
 * Knowledge Base - provides product and FAQ data retrieval for the chat engine.
 */
export class KnowledgeBase {
  /**
   * Searches products by keyword in name, SKU, features, or description.
   */
  async searchProducts(keyword: string): Promise<ChatResponse['suggestedProducts']> {
    if (!keyword || keyword.length < 2) return [];

    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: keyword } },
          { sku: { contains: keyword } },
          { features: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },
      take: 5,
      select: { sku: true, name: true },
    });

    return products.map((p) => ({
      sku: p.sku,
      name: p.name,
      url: `/products/${p.sku.toLowerCase()}`,
    }));
  }

  /**
   * Finds products by tile dimension specifications.
   */
  async findProductsByTileSize(width: number, height: number, thickness?: number) {
    const allProducts = await prisma.product.findMany({
      where: { isPublished: true },
      select: {
        sku: true,
        name: true,
        panelSize: true,
        panelThickness: true,
        features: true,
      },
    });

    const matches: ChatResponse['suggestedProducts'] = [];

    for (const product of allProducts) {
      let isMatch = false;

      if (product.panelSize) {
        const range = parseDimensionRange(product.panelSize);
        if (range) {
          const tileW = Math.min(width, height);
          const tileH = Math.max(width, height);
          if (tileW >= range.minW && tileW <= range.maxW && tileH >= range.minH && tileH <= range.maxH) {
            isMatch = true;
          }
        }
      }

      if (isMatch && thickness && product.panelThickness) {
        const thicknesses = parseThickness(product.panelThickness);
        if (thicknesses.length > 0) {
          const minT = Math.min(...thicknesses);
          const maxT = Math.max(...thicknesses);
          if (thickness < minT || thickness > maxT) {
            isMatch = false;
          }
        }
      }

      if (isMatch) {
        matches.push({
          sku: product.sku,
          name: product.name,
          url: `/products/${product.sku.toLowerCase()}`,
        });
      }
    }

    return matches;
  }

  /**
   * Searches FAQs by keyword.
   */
  async searchFAQs(keyword: string): Promise<{ question: string; answer: string } | null> {
    const faqs = await prisma.fAQ.findMany({
      where: {
        OR: [
          { question: { contains: keyword } },
          { keywords: { contains: keyword } },
          { answer: { contains: keyword } },
        ],
      },
      take: 1,
    });

    if (faqs.length === 0) return null;
    return { question: faqs[0].question, answer: faqs[0].answer };
  }
}

export const knowledgeBase = new KnowledgeBase();
