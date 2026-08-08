import { z } from 'zod';
import type { FileCategory } from '@/types/attachment';

/**
 * Upload validation constants and Zod schemas.
 *
 * This module is the single source of truth for allowed file types, size
 * limits, and attachment schema validation. Both client-side and
 * server-side code import from here to ensure consistent rules.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum file size: 10 MB in bytes. */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Maximum number of files per inquiry. */
export const MAX_FILE_COUNT = 5;

/** All allowed file extensions (lowercase, no dot). */
export const ALLOWED_EXTENSIONS: readonly string[] = [
  // Images
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  // Documents
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  // CAD
  'dwg',
  'dxf',
  // Others
  'txt',
  'csv',
] as const;

/** Extensions grouped by category for the `categorizeFileType` function. */
const EXTENSION_CATEGORIES: Record<string, FileCategory> = {
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  webp: 'image',
  gif: 'image',
  pdf: 'document',
  doc: 'document',
  docx: 'document',
  xls: 'document',
  xlsx: 'document',
  ppt: 'document',
  pptx: 'document',
  dwg: 'cad',
  dxf: 'cad',
  txt: 'other',
  csv: 'other',
};

/**
 * Determines the broad category of a file based on its extension.
 *
 * @param ext - File extension without the dot, case-insensitive.
 * @returns The file category, or 'other' if the extension is not recognized.
 */
export function categorizeFileType(ext: string): FileCategory {
  const normalized = ext.toLowerCase().replace(/^\./, '');
  return EXTENSION_CATEGORIES[normalized] ?? 'other';
}

/**
 * Checks whether a file extension is in the allowed list.
 *
 * @param ext - File extension without the dot, case-insensitive.
 * @returns True if the extension is allowed.
 */
export function isAllowedExtension(ext: string): boolean {
  const normalized = ext.toLowerCase().replace(/^\./, '');
  return ALLOWED_EXTENSIONS.includes(normalized);
}

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for validating an Attachment object.
 *
 * Used by the inquiry creation schema to validate the `attachments` array
 * and by the upload API to validate the response payload.
 */
export const attachmentSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  fileName: z.string().min(1, 'File name is required').max(255),
  fileSize: z.number().int().nonnegative(),
  fileType: z
    .string()
    .min(1)
    .max(20)
    .refine((val) => isAllowedExtension(val), {
      message: 'File type is not allowed',
    }),
  fileCategory: z.enum(['image', 'document', 'cad', 'other']),
});

/** Array schema enforcing the max file count. */
export const attachmentsSchema = z.array(attachmentSchema).max(MAX_FILE_COUNT);

/** TypeScript type derived from the attachment Zod schema. */
export type AttachmentInput = z.infer<typeof attachmentSchema>;
