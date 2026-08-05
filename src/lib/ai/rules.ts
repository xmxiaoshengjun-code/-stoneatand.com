import { knowledgeBase } from './knowledgeBase';
import { SERIES_INFO, TOTAL_SKU_COUNT, TOTAL_SERIES_COUNT } from '@/lib/constants/series';
import type { ChatResponse } from '@/types/chat';

/**
 * Rule Engine - V1.0 keyword-based matching for common customer questions.
 * Each rule checks for keywords in the user message and returns a structured response.
 */
export class RuleEngine {
  private rules: Array<{
    keywords: string[];
    handler: (message: string, original: string) => Promise<ChatResponse | null>;
  }>;

  constructor() {
    this.rules = [
      // Greeting
      {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        handler: async () => ({
          reply: "Hello! Welcome to TSIANFAN. We're a professional manufacturer of tile, stone and flooring display stands with 18+ years of experience. How can I help you today? You can ask about our products, find a rack for your tiles, or request a quote.",
          suggestedProducts: [],
        }),
      },
      // Product count / SKU
      {
        keywords: ['how many', 'sku', 'model', 'count', 'products do you have'],
        handler: async () => ({
          reply: `We offer ${TOTAL_SKU_COUNT} SKUs across ${TOTAL_SERIES_COUNT} product series. Our range includes wall sliding racks, drawer cabinets, combination frames, page-turning stands, reclining frames, simple frames, and floor-standing racks. Visit our Products page to browse the full catalog.`,
          suggestedProducts: [],
        }),
      },
      // Series info
      {
        keywords: ['series', 'category', 'types', 'what kind'],
        handler: async () => ({
          reply: `We have ${TOTAL_SERIES_COUNT} product series:\n${SERIES_INFO.map((s, i) => `${i + 1}. ${s.name} (${s.prefix}) - ${s.shortDescription}`).join('\n')}\n\nWould you like more details about any specific series?`,
          suggestedProducts: [],
        }),
      },
      // Price / quote
      {
        keywords: ['price', 'cost', 'quote', 'pricing', 'how much', 'rate', 'moq', 'minimum order'],
        handler: async () => ({
          reply: "For pricing and quotes, please submit an inquiry through our Contact form or click the 'Request Quote' button on any product page. Our sales team will respond within 24 hours with detailed pricing and MOQ information.",
          suggestedProducts: [],
        }),
      },
      // Shipping
      {
        keywords: ['ship', 'delivery', 'freight', 'export', 'country', 'international', 'container'],
        handler: async () => ({
          reply: "We export to 80+ countries across North America, Europe, and Asia. We can arrange FOB, CIF, or DDP shipping terms. Each product page lists packaging dimensions to help with container loading planning. 80% of our products are exported to Europe and America.",
          suggestedProducts: [],
        }),
      },
      // Company info
      {
        keywords: ['company', 'about', 'who are', 'experience', 'history', 'located', 'where'],
        handler: async () => ({
          reply: "TSIANFAN has 18+ years of experience manufacturing tile display racks and stands. We're headquartered in Xiamen, Fujian, China. We export 80% of our products to Europe and America, serving tile brands, distributors, and showroom designers in 80+ countries worldwide.",
          suggestedProducts: [],
        }),
      },
      // Contact
      {
        keywords: ['contact', 'email', 'phone', 'whatsapp', 'reach', 'call'],
        handler: async () => ({
          reply: "You can reach us at:\n- Email: web@tsianfan.com\n- Phone / WhatsApp: +86 13365904989\n- Address: Room 2B, No. 27, Xiangxing 1st Road, Huli District, Xiamen, China\n\nOr visit our Contact page to send us a message.",
          suggestedProducts: [],
        }),
      },
      // Thickness
      {
        keywords: ['thickness', 'thin', 'thick', 'mm panel', 'slab'],
        handler: async () => ({
          reply: "Our display racks support tile thicknesses from 7mm to 20mm:\n• 7-9.5mm ultra-thin: CX2019, CX006\n• 10mm thin: CT611, CE014\n• 12mm standard: most CC, CH, CF, CE models\n• 15mm standard thick: most CT, CX, CE models\n• 20mm thick slab: CL210, CL213\n\nYou can also use our Spec Finder tool to match your tile thickness.",
          suggestedProducts: [],
        }),
      },
      // Customization
      {
        keywords: ['custom', 'customize', 'special', 'bespoke', 'tailor'],
        handler: async () => ({
          reply: "Yes, we offer custom solutions! Models like CC2064 and CC2061 have fully customizable sample sizes. We can also customize dimensions and configurations for other models. Contact our sales team with your specific requirements.",
          suggestedProducts: [],
        }),
      },
      // Tile size / spec finder
      {
        keywords: ['tile size', 'dimension', 'spec', 'fit', 'match', 'compatible', '600x', '800x', '1200x'],
        handler: async (message) => {
          // Try to extract dimensions from message
          const dimMatch = message.match(/(\d+)\s*[x×]\s*(\d+)/);
          if (dimMatch) {
            const w = parseInt(dimMatch[1], 10);
            const h = parseInt(dimMatch[2], 10);
            const thicknessMatch = message.match(/(\d+)\s*mm/);
            const t = thicknessMatch ? parseInt(thicknessMatch[1], 10) : undefined;
            const products = await knowledgeBase.findProductsByTileSize(w, h, t);
            if (products.length > 0) {
              return {
                reply: `Great! I found ${products.length} display rack(s) compatible with ${w}×${h}mm tiles${t ? ` (${t}mm thickness)` : ''}. Here are the best matches:`,
                suggestedProducts: products.slice(0, 5),
              };
            }
            return {
              reply: `I searched for racks compatible with ${w}×${h}mm tiles but couldn't find an exact match. Please try our Spec Finder tool for a more detailed search, or contact our sales team for custom solutions.`,
              suggestedProducts: [],
            };
          }
          return {
            reply: "You can use our Spec Finder tool to find display racks compatible with your tile dimensions. Just enter your tile width, height, and thickness. Would you like me to help you find a specific size?",
            suggestedProducts: [],
          };
        },
      },
      // FAQ search fallback
      {
        keywords: [],
        handler: async (message) => {
          const faq = await knowledgeBase.searchFAQs(message);
          if (faq) {
            return {
              reply: faq.answer,
              suggestedProducts: [],
            };
          }
          // Product search
          const products = await knowledgeBase.searchProducts(message);
          if (products && products.length > 0) {
            return {
              reply: `I found some products that might interest you:`,
              suggestedProducts: products,
            };
          }
          return null;
        },
      },
    ];
  }

  /**
   * Matches a user message against all rules and returns the first matching response.
   */
  async match(lowerMessage: string, originalMessage: string): Promise<ChatResponse | null> {
    for (const rule of this.rules) {
      if (rule.keywords.length === 0) {
        // Fallback rule - always try
        const result = await rule.handler(lowerMessage, originalMessage);
        if (result) return result;
      } else {
        const isMatch = rule.keywords.some((kw) => lowerMessage.includes(kw));
        if (isMatch) {
          const result = await rule.handler(lowerMessage, originalMessage);
          if (result) return result;
        }
      }
    }
    return null;
  }
}

export const ruleEngine = new RuleEngine();
