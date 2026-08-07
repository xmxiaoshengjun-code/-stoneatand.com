import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

/**
 * Merges Tailwind CSS class names intelligently, resolving conflicts.
 *
 * @param inputs - Class values to merge.
 * @returns A single merged class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or Date object into a readable display format.
 *
 * @param date - ISO date string or Date object.
 * @param formatStr - date-fns format string (default: 'MMM d, yyyy').
 * @returns Formatted date string, or empty string if input is falsy.
 */
export function formatDate(date: string | Date | null | undefined, formatStr = 'MMM d, yyyy'): string {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, formatStr);
  } catch {
    return '';
  }
}

/**
 * Formats a datetime string into a readable date and time display.
 *
 * @param date - ISO datetime string or Date object.
 * @returns Formatted datetime string (e.g., "Aug 4, 2026, 2:30 PM").
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  return formatDate(date, "MMM d, yyyy, h:mm a");
}

/**
 * Truncates a string to a maximum length, appending an ellipsis.
 *
 * @param str - The string to truncate.
 * @param maxLength - Maximum length before truncation (default: 100).
 * @returns Truncated string with ellipsis, or original if shorter.
 */
export function truncate(str: string, maxLength = 100): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Generates a URL-friendly slug from a string.
 *
 * @param str - The string to slugify.
 * @returns A kebab-case slug suitable for URLs.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates an inquiry number in format INQ-yyyyMMdd-nnn.
 *
 * @param sequence - The daily sequence number (1-based).
 * @returns Formatted inquiry number (e.g., "INQ-20260804-001").
 */
export function generateInquiryNo(sequence: number): string {
  const dateStr = format(new Date(), 'yyyyMMdd');
  const seqStr = String(sequence).padStart(3, '0');
  return `INQ-${dateStr}-${seqStr}`;
}

/**
 * Formats a file size in bytes to a human-readable string.
 *
 * @param bytes - File size in bytes.
 * @returns Human-readable size (e.g., "1.5 MB").
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Parses a dimension range string like "600×600 ~ 1200×2800 mm".
 * Returns the min and max values for width and height.
 *
 * @param rangeStr - The range string to parse.
 * @returns Object with minW, maxW, minH, maxH, or null if unparseable.
 */
export function parseDimensionRange(rangeStr: string): {
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
} | null {
  if (!rangeStr) return null;

  // Detect if the range string uses centimeters (cm) rather than millimeters (mm).
  // DB panelSize values are stored in cm (e.g., "60x60cm - 120x240cm"), but user
  // input in the spec-finder is always in mm (e.g., 600x1200). We convert cm→mm
  // by multiplying by 10 so comparisons are consistent.
  const isCm = /cm/i.test(rangeStr);
  const multiplier = isCm ? 10 : 1;

  // Match patterns like "600x600 ~ 1200x2800 mm" or "600×600-1200×2800mm"
  const match = rangeStr.match(/(\d+)\s*[x×]\s*(\d+)\s*[~\-–to]+\s*(\d+)\s*[x×]\s*(\d+)/i);
  if (match) {
    return {
      minW: parseInt(match[1], 10) * multiplier,
      minH: parseInt(match[2], 10) * multiplier,
      maxW: parseInt(match[3], 10) * multiplier,
      maxH: parseInt(match[4], 10) * multiplier,
    };
  }
  // Try single dimension like "600x600 mm"
  const singleMatch = rangeStr.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (singleMatch) {
    const w = parseInt(singleMatch[1], 10) * multiplier;
    const h = parseInt(singleMatch[2], 10) * multiplier;
    return { minW: w, maxW: w, minH: h, maxH: h };
  }
  return null;
}

/**
 * Parses a thickness string and extracts numeric values in mm.
 * Handles formats like "10mm", "8-12mm", "10/12/15mm".
 *
 * @param thicknessStr - The thickness string to parse.
 * @returns Array of thickness values in mm, or empty array if unparseable.
 */
export function parseThickness(thicknessStr: string): number[] {
  if (!thicknessStr) return [];
  const matches = thicknessStr.match(/(\d+(?:\.\d+)?)/g);
  if (!matches) return [];
  return matches.map((m) => parseFloat(m));
}

/**
 * Validates an email address format.
 *
 * @param email - The email string to validate.
 * @returns True if the email format is valid.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Safely parses a JSON string, returning a fallback value on failure.
 *
 * @param jsonStr - The JSON string to parse.
 * @param fallback - The fallback value if parsing fails.
 * @returns Parsed value or fallback.
 */
export function safeJsonParse<T>(jsonStr: string | null | undefined, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

/**
 * Delays execution for a specified number of milliseconds.
 *
 * @param ms - Milliseconds to sleep.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Appends a cache-busting version parameter to local image URLs.
 *
 * When product images are replaced on disk (same filename, different content),
 * browsers with `immutable` cache won't re-fetch. Adding `?v=<version>` changes
 * the URL, forcing a fresh request. External URLs (http/https) are returned as-is.
 *
 * Bump IMG_VERSION when images are replaced site-wide.
 *
 * @param url - The image URL (local path or external URL).
 * @returns URL with `?v=<version>` appended for local paths.
 */
const IMG_VERSION = '2';
export function imgUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('data:')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${IMG_VERSION}`;
}
