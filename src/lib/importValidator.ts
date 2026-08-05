import { z } from 'zod';

/**
 * Product Import Validator - validates CSV/JSON data for bulk product import.
 * Used by the admin product import feature.
 */

export const productImportSchema = z.object({
  sku: z.string().min(2).max(20),
  seriesPrefix: z.string().min(2).max(2),
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  standSize: z.string().max(200).optional(),
  panelSize: z.string().max(200).optional(),
  panelThickness: z.string().max(50).optional(),
  packageSize: z.string().max(200).optional(),
  numberOfPanel: z.coerce.number().int().min(0).max(100).optional(),
  weight: z.string().max(50).optional(),
  material: z.string().max(200).optional(),
  features: z.string().max(1000).optional(),
  isFeatured: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export type ProductImportItem = z.infer<typeof productImportSchema>;

export interface ImportResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
  data: ProductImportItem[];
}

/**
 * Validates an array of raw product data objects for import.
 *
 * @param rows - Array of raw objects from CSV/JSON parsing.
 * @returns Validation result with valid data and any errors.
 */
export function validateProductImport(rows: Record<string, unknown>[]): ImportResult {
  const errors: Array<{ row: number; field: string; message: string }> = [];
  const validData: ProductImportItem[] = [];

  rows.forEach((row, index) => {
    const result = productImportSchema.safeParse(row);
    if (result.success) {
      validData.push(result.data);
    } else {
      const fieldErrors = result.error.flatten().fieldErrors;
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          errors.push({
            row: index + 1,
            field,
            message: messages[0],
          });
        }
      });
    }
  });

  return {
    success: errors.length === 0,
    totalRows: rows.length,
    validRows: validData.length,
    errors,
    data: validData,
  };
}

/**
 * CSV header mapping for product import.
 * Maps CSV column names to field names.
 */
export const CSV_HEADER_MAP: Record<string, string> = {
  SKU: 'sku',
  'Series Prefix': 'seriesPrefix',
  Name: 'name',
  Description: 'description',
  'Stand Size': 'standSize',
  'Panel Size': 'panelSize',
  'Panel Thickness': 'panelThickness',
  'Package Size': 'packageSize',
  'Number of Panels': 'numberOfPanel',
  Weight: 'weight',
  Material: 'material',
  Features: 'features',
  Featured: 'isFeatured',
  Published: 'isPublished',
  'Sort Order': 'sortOrder',
};
