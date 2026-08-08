import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { successResponse, errorResponse } from '@/types/api';
import {
  MAX_FILE_SIZE,
  isAllowedExtension,
  categorizeFileType,
} from '@/lib/validations/upload';
import {
  getFileExtension,
  generateUniqueFileName,
  sanitizeFileName,
} from '@/lib/utils/file';
import type { Attachment } from '@/types/attachment';

/**
 * POST /api/uploads/inquiry — Public file upload endpoint for website visitors.
 *
 * Accepts multipart/form-data with a single `file` field. Validates the file
 * extension against a whitelist, enforces a 10 MB size limit, and saves the
 * file to `public/uploads/inquiries/` with a sanitized, timestamped filename.
 *
 * This endpoint does NOT require admin authentication — it is intended for
 * public use from the inquiry (contact) form.
 *
 * Returns: { code: 200, data: Attachment, message: "File uploaded" }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        errorResponse(400, 'No file provided'),
        { status: 400 }
      );
    }

    // --- Validate file size ---
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        errorResponse(400, `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`),
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        errorResponse(400, 'File is empty.'),
        { status: 400 }
      );
    }

    // --- Validate file extension ---
    const ext = getFileExtension(file.name);
    if (!ext) {
      return NextResponse.json(
        errorResponse(400, 'File has no extension.'),
        { status: 400 }
      );
    }

    if (!isAllowedExtension(ext)) {
      return NextResponse.json(
        errorResponse(400, `File type ".${ext}" is not allowed.`),
        { status: 400 }
      );
    }

    // --- MIME type validation ---
    // CAD files (.dwg, .dxf) are reported by browsers as application/octet-stream.
    // We accept octet-stream only when the extension is in the whitelist.
    // For image types, we do a stricter MIME check.
    const imageMimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };

    const expectedImageMime = imageMimeMap[ext];
    if (expectedImageMime) {
      // For images, enforce MIME type match
      if (file.type && file.type !== expectedImageMime) {
        return NextResponse.json(
          errorResponse(400, `File MIME type "${file.type}" does not match extension ".${ext}".`),
          { status: 400 }
        );
      }
    } else if (file.type && file.type !== 'application/octet-stream') {
      // For non-image files, accept most MIME types but block obvious mismatches
      // (e.g., an executable pretending to be a PDF). We allow empty MIME types
      // since some browsers don't set them for uncommon extensions.
      const dangerousMimes = [
        'application/x-msdownload',
        'application/x-executable',
        'application/x-dosexec',
        'text/html',
      ];
      if (dangerousMimes.includes(file.type)) {
        return NextResponse.json(
          errorResponse(400, `File MIME type "${file.type}" is not allowed.`),
          { status: 400 }
        );
      }
    }

    // --- Generate unique filename and save ---
    const uniqueFileName = generateUniqueFileName(file.name);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'inquiries');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // --- Build response ---
    const url = `/uploads/inquiries/${uniqueFileName}`;
    const fileCategory = categorizeFileType(ext);
    // Use sanitized original name for display (without the unique prefix)
    const displayFileName = sanitizeFileName(file.name);

    const attachment: Attachment = {
      url,
      fileName: displayFileName,
      fileSize: file.size,
      fileType: ext,
      fileCategory,
    };

    return NextResponse.json(
      successResponse(attachment, 'File uploaded'),
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/uploads/inquiry error:', error);
    return NextResponse.json(
      errorResponse(500, 'Failed to upload file'),
      { status: 500 }
    );
  }
}
