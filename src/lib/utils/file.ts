/**
 * File utility functions for upload handling.
 *
 * Provides filename sanitization, unique name generation, extension
 * extraction, and human-readable file size formatting.
 */

/**
 * Sanitizes a file name by removing dangerous characters.
 *
 * Keeps alphanumeric characters, dashes, underscores, and dots. All other
 * characters (including path separators) are replaced with dashes to
 * prevent path traversal attacks.
 *
 * @param name - The original file name.
 * @returns A sanitized file name safe for use on the filesystem.
 */
export function sanitizeFileName(name: string): string {
  if (!name) return 'file';
  // Take only the base name (strip any path components)
  const baseName = name.split(/[\\/]/).pop() || name;
  // Replace any character that is not alphanumeric, dash, underscore, or dot
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, '-');
  // Collapse multiple consecutive dashes into one
  const collapsed = sanitized.replace(/-{2,}/g, '-');
  // Remove leading/trailing dashes
  const trimmed = collapsed.replace(/^-+|-+$/g, '');
  // Ensure the result is non-empty
  return trimmed || 'file';
}

/**
 * Generates a unique file name by prepending a timestamp and random string.
 *
 * Format: `{timestamp}-{randomString}-{sanitizedOriginalName}`
 *
 * @param originalName - The original file name.
 * @returns A unique file name unlikely to collide with existing files.
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  const sanitized = sanitizeFileName(originalName);
  return `${timestamp}-${randomStr}-${sanitized}`;
}

/**
 * Extracts the file extension from a file name (without the dot).
 *
 * @param name - The file name.
 * @returns The lowercase extension without the dot, or empty string if none.
 */
export function getFileExtension(name: string): string {
  if (!name) return '';
  const lastDot = name.lastIndexOf('.');
  if (lastDot === -1 || lastDot === name.length - 1) return '';
  return name.slice(lastDot + 1).toLowerCase();
}

/**
 * Formats a file size in bytes to a human-readable string.
 *
 * @param bytes - File size in bytes.
 * @returns Human-readable size (e.g., "1.5 MB", "500 KB", "0 B").
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeIndex = Math.min(i, sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, safeIndex)).toFixed(1)) + ' ' + sizes[safeIndex];
}
