import { z } from 'zod';

/**
 * Zod validation schema for product queries.
 */
export const productFilterSchema = z.object({
  series: z.string().optional(),
  panelSize: z.string().optional(),
  panelThickness: z.string().optional(),
  keyword: z.string().max(200).optional(),
  isFeatured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.enum(['sku', 'name', 'newest', 'featured', 'sortOrder']).default('sortOrder'),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;

/**
 * Zod validation schema for spec finder queries.
 */
export const specFinderSchema = z.object({
  tileWidth: z.coerce.number().int().min(50).max(5000),
  tileHeight: z.coerce.number().int().min(50).max(5000),
  tileThickness: z.coerce.number().min(1).max(50).optional(),
});

export type SpecFinderInput = z.infer<typeof specFinderSchema>;

/**
 * Zod validation schema for product creation/update.
 */
export const productCreateSchema = z.object({
  sku: z.string().min(2).max(30).regex(/^[A-Z]{2,4}-?\d{2,4}(-?\d{1,2})?$/, 'SKU format: PREFIX-NNN (e.g., CT-011, DDF001-1, SRT930)'),
  seriesId: z.number().int().positive(),
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  standSize: z.string().max(200).optional(),
  panelSize: z.string().max(200).optional(),
  panelThickness: z.string().max(50).optional(),
  packageSize: z.string().max(200).optional(),
  numberOfPanel: z.number().int().min(0).max(100).optional(),
  adjustablePanelSize: z.string().max(200).optional(),
  weight: z.string().max(50).optional(),
  material: z.string().max(200).optional(),
  features: z.string().max(1000).optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
