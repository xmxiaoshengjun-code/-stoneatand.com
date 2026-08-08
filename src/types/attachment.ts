/**
 * Attachment type definitions for inquiry file uploads.
 *
 * An attachment represents a file uploaded by a website visitor as part of
 * an inquiry (RFQ) submission. Files are stored on disk under
 * `/public/uploads/inquiries/` and metadata is persisted as a JSON array
 * in the Inquiry table's `attachments` column.
 */

/** Broad category used for icon selection and grouping in the UI. */
export type FileCategory = 'image' | 'document' | 'cad' | 'other';

/**
 * Represents a single uploaded attachment associated with an inquiry.
 */
export interface Attachment {
  /** Public URL path, e.g. "/uploads/inquiries/1700000000-abc.pdf". */
  url: string;
  /** Original file name after sanitization (no path traversal chars). */
  fileName: string;
  /** File size in bytes. */
  fileSize: number;
  /** File extension without the dot, lowercased, e.g. "pdf". */
  fileType: string;
  /** Broad category for display grouping. */
  fileCategory: FileCategory;
}
