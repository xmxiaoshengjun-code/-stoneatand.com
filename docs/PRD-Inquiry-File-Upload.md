# PRD: Inquiry File Upload Feature

## 1. Project Information

| Field | Value |
|-------|-------|
| **Language** | English (frontend) / Chinese (admin) |
| **Tech Stack** | Next.js 14+ / TypeScript / Tailwind CSS / shadcn/ui / Prisma / SQLite |
| **Project Name** | inquiry-file-upload |
| **Project Path** | `C:\Users\Sean xiao\WorkBuddy\2026-08-04-09-49-32\qianfan-website` |
| **Server** | localhost:3009 |

### Original Requirement

> 需客户的询盘栏目添加一个图片或者文件的上传功能，文件可以兼顾世界办公室应该的主流文件格式，这样便于我们可以收理解客户需求

**Translation**: Add an image/file upload feature to the customer inquiry section. Files should support mainstream office file formats used worldwide, so we can better understand customer requirements.

---

## 2. Product Goals

1. **Enable rich context submission** — Allow customers to upload images, drawings, spec sheets, and documents alongside their text inquiry, so the sales team can fully understand requirements without back-and-forth emails.
2. **Broad format compatibility** — Support all mainstream office and design file formats used by international B2B buyers (images, PDFs, Office documents, CAD files), reducing friction for global customers.
3. **Seamless admin workflow** — Display uploaded attachments directly in the admin inquiry detail page with download capability, so sales staff can access files without leaving the CRM interface.

---

## 3. User Stories

### Customer Perspective

- **US-1**: As a potential buyer, I want to upload product photos or reference images with my inquiry, so that the sales team can see exactly what product or specification I'm looking for.
- **US-2**: As an international buyer, I want to attach my company's spec sheet or BOQ (Bill of Quantities) as a PDF or Excel file, so that I don't have to retype all the specifications in the message field.
- **US-3**: As a customer with custom design requirements, I want to upload CAD drawings (DWG/DXF), so that the engineering team can review feasibility before quoting.
- **US-4**: As a mobile user, I want to select photos directly from my phone's gallery to attach to my inquiry, so that I can quickly share product references on the go.

### Admin / Sales Perspective

- **US-5**: As a sales manager, I want to see all attached files directly in the inquiry detail page, so that I can review customer requirements without switching to email or other tools.
- **US-6**: As a sales representative, I want to download all attachments from an inquiry with one click, so that I can forward them to the engineering or pricing team for quotation.

---

## 4. Requirements Pool

### P0 — Must Have (Core File Upload)

| ID | Requirement | Description |
|----|-------------|-------------|
| P0-1 | **File upload UI on InquiryForm** | Add a drag-and-drop upload zone + file picker button to the existing `InquiryForm.tsx` component. Must work in all 3 usage contexts: contact page, product detail dialog, and spec-finder page. |
| P0-2 | **File type validation** | Reject files with unsupported extensions. Show a clear error message: "File type not supported. Allowed: JPG, PNG, WebP, GIF, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, DWG, DXF." |
| P0-3 | **File size validation** | Reject individual files larger than 10MB. Show error: "File exceeds 10MB limit." Reject total upload if more than 5 files. |
| P0-4 | **Upload API endpoint** | Create `POST /api/uploads/inquiry` endpoint that accepts `multipart/form-data`, validates file type/size server-side, saves to `public/uploads/inquiries/`, and returns the file URL + metadata. |
| P0-5 | **Inquiry submission with attachments** | Modify `InquiryForm` to use `FormData` (multipart) instead of JSON for submission, or upload files first then include attachment URLs in the JSON payload. The `POST /api/inquiries` endpoint must accept and persist attachment metadata. |
| P0-6 | **Database schema update** | Add `attachments` field (String, storing JSON-serialized array of `{url, fileName, fileSize, fileType}`) to the `Inquiry` Prisma model. |
| P0-7 | **File list UI** | Show selected files in a list below the upload zone with: file type icon, file name, file size, and a remove (X) button. Show upload progress bar per file during upload. |

### P1 — Should Have (Admin Viewing)

| ID | Requirement | Description |
|----|-------------|-------------|
| P1-1 | **Admin attachment display** | In `InquiryDetail.tsx`, add an "Attachments" section (附件) that lists all files from the inquiry's `attachments` field. Show file type icon, name, and size for each. |
| P1-2 | **Download individual files** | Each attachment in admin view should have a download link/button that opens or downloads the file from `public/uploads/inquiries/`. |
| P1-3 | **Image preview thumbnails** | For image attachments (JPG, PNG, WebP, GIF), show a thumbnail preview in the admin inquiry detail. Clicking opens a lightbox/full-size view. |
| P1-4 | **Inquiry list attachment indicator** | In the admin inquiry list table, show a paperclip icon (📎) next to inquiries that have attachments, so sales can quickly identify which inquiries include files. |
| P1-5 | **Server-side MIME validation** | Beyond extension checking, validate the actual MIME type of uploaded files server-side to prevent disguised malicious uploads. |

### P2 — Nice to Have (Enhancements)

| ID | Requirement | Description |
|----|-------------|-------------|
| P2-1 | **Virus scan** | Scan uploaded files for malware using a library like `clamav` or a cloud scanning service. |
| P2-2 | **Download all as ZIP** | Add a "Download All" button in admin inquiry detail that bundles all attachments into a single ZIP file. |
| P2-3 | **Drag-to-reorder** | Allow customers to reorder attachments by dragging, so they can indicate priority/sequence of files. |
| P2-4 | **Spec-finder integration** | Add an inquiry form with file upload to the spec-finder page (`/en/spec-finder`) when no matching products are found, pre-filled with the search criteria as context. |
| P2-5 | **Auto-cleanup** | Scheduled job to delete orphaned upload files (files uploaded but inquiry never submitted) older than 24 hours. |
| P2-6 | **File name sanitization** | Rename uploaded files to a sanitized format (e.g., `inquiry_{timestamp}_{original_name}`) to prevent path traversal and encoding issues. |

---

## 5. Supported File Formats

### Image Files
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| .jpg / .jpeg | image/jpeg | Standard photo format |
| .png | image/png | Lossless image with transparency |
| .webp | image/webp | Modern efficient format |
| .gif | image/gif | Animated images |

### Document Files
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| .pdf | application/pdf | Universal document format |
| .doc | application/msword | Word 97-2003 |
| .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document | Word 2007+ |
| .xls | application/vnd.ms-excel | Excel 97-2003 |
| .xlsx | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | Excel 2007+ |
| .ppt | application/vnd.ms-powerpoint | PowerPoint 97-2003 |
| .pptx | application/vnd.openxmlformats-officedocument.presentationml.presentation | PowerPoint 2007+ |

### CAD / Design Files
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| .dwg | application/acad (or octet-stream) | AutoCAD drawing |
| .dxf | application/dxf (or octet-stream) | AutoCAD drawing exchange |

### Other Files
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| .txt | text/plain | Plain text |
| .csv | text/csv | Comma-separated values |

### Limits
- **Max file size**: 10 MB per file
- **Max files per inquiry**: 5 files
- **Total max upload size**: 50 MB (5 × 10 MB)

---

## 6. UI Design Draft

### 6.1 Customer-Facing Upload Zone (English UI)

Located below the Message textarea in `InquiryForm.tsx`, before the Submit button:

```
┌─────────────────────────────────────────────────────┐
│  Attachments                                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │                                             │    │
│  │     📁  Drag & drop files here              │    │
│  │        or click to browse                   │    │
│  │                                             │    │
│  │  Max 5 files, 10MB each                     │    │
│  │  Supported: JPG, PNG, PDF, DOC, XLS, DWG... │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Selected Files:                                    │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🖼️  project-reference.jpg        2.3 MB  ✕  │    │
│  │      ─────────────── 100%                    │    │
│  │ 📄  spec-sheet.pdf               1.1 MB  ✕  │    │
│  │      ─────────────── 100%                    │    │
│  │ 📊  boq.xlsx                    856 KB  ✕  │    │
│  │      ──────────── 100%                       │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [ Submit Inquiry ]                                 │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Click the dashed-border zone → opens native file picker (supports multi-select)
- Drag files onto the zone → zone highlights (border turns brand color)
- Unsupported file type → toast error, file rejected
- File > 10MB → toast error, file rejected
- More than 5 files → toast error, extra files rejected
- During upload → progress bar per file (0-100%)
- Click X on a file → removes it from the list (and deletes from server if already uploaded)
- Upload happens immediately on file selection (not on form submit) for better UX

### 6.2 Admin Attachment Display (Chinese UI)

In `InquiryDetail.tsx`, add a new Card below the existing "询盘详情" card:

```
┌─────────────────────────────────────────────────────┐
│  附件 (3)                                           │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  [image]  │  │  📄 PDF  │  │  📊 XLSX │         │
│  │           │  │           │  │           │         │
│  │ reference │  │ spec-sheet│  │   boq     │         │
│  │  2.3 MB   │  │  1.1 MB   │  │  856 KB   │         │
│  │  下载 ↓   │  │  下载 ↓  │  │  下载 ↓   │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  [ 下载全部 (ZIP) ]                                  │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Image attachments show thumbnail preview; click to open lightbox
- Non-image files show a file-type icon (based on extension)
- Each file has a "下载" (Download) link that opens the file in a new tab or downloads it
- "下载全部 (ZIP)" button (P2) bundles all files into a ZIP

### 6.3 Dialog Context (Product Detail Page)

When `InquiryForm` is used inside `InquiryButton` dialog (max-w-2xl), the upload zone should:
- Be fully responsive within the dialog width
- Stack the selected file list vertically (no horizontal scroll)
- Dialog should auto-scroll to show newly added files

### 6.4 Admin Inquiry List Indicator

In the admin inquiry list table, add a column or icon indicator:
- Inquiries with attachments show a 📎 (paperclip) icon
- Inquiries without attachments show nothing (clean look)

---

## 7. Technical Specification

### 7.1 Database Changes

**Prisma Schema** (`prisma/schema.prisma`):

Add to `Inquiry` model:
```prisma
model Inquiry {
  // ... existing fields ...
  attachments  String?  // JSON string: [{"url":"...", "fileName":"...", "fileSize":123, "fileType":"image/jpeg"}]
  // ... rest ...
}
```

Note: SQLite does not support arrays or JSON types natively, so `attachments` is stored as a `String?` containing a JSON-serialized array. Parse/stringify on read/write.

**Migration SQL** (`scripts/migrate-add-attachments.sql`):
```sql
ALTER TABLE Inquiry ADD COLUMN attachments TEXT;
```

### 7.2 API Changes

**New endpoint: `POST /api/uploads/inquiry`**
- Accepts: `multipart/form-data` with one or more files
- Validates: file extension + MIME type, file size (≤ 10MB)
- Saves to: `public/uploads/inquiries/{timestamp}_{sanitized_filename}`
- Returns: `{ code: 201, data: { url: "/uploads/inquiries/...", fileName: "...", fileSize: 123, fileType: "image/jpeg" } }`

**Modified endpoint: `POST /api/inquiries`**
- Accepts: JSON with optional `attachments` array field
- `attachments`: `[{ url: string, fileName: string, fileSize: number, fileType: string }]`
- Persists: JSON.stringify(attachments) → `Inquiry.attachments`

**Modified endpoint: `GET /api/inquiries/:id`**
- Returns: `attachments` field parsed from JSON string to array in response

### 7.3 Validation Schema Update

`src/lib/validations/inquiry.ts`:
```typescript
export const attachmentSchema = z.object({
  url: z.string(),
  fileName: z.string().max(255),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024), // 10MB
  fileType: z.string().max(100),
});

export const inquiryCreateSchema = z.object({
  // ... existing fields ...
  attachments: z.array(attachmentSchema).max(5).optional(),
});
```

### 7.4 Types Update

`src/types/inquiry.ts`:
```typescript
export interface Attachment {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface Inquiry {
  // ... existing fields ...
  attachments: Attachment[] | null;
}
```

### 7.5 File Storage

- **Directory**: `public/uploads/inquiries/`
- **Naming**: `{inquiry_no or timestamp}_{sanitized_original_name}` (e.g., `20260804-001_project-reference.jpg`)
- **Access**: Directly accessible via static file serving (Next.js `public/` directory)
- **No auth required for download**: Files are publicly accessible once uploaded (simplifies admin access and sharing with engineering team)

### 7.6 File Type Icon Mapping

| Category | Extensions | Icon (lucide-react) |
|----------|-----------|---------------------|
| Image | jpg, jpeg, png, webp, gif | `Image` |
| PDF | pdf | `FileText` |
| Word | doc, docx | `FileText` |
| Excel | xls, xlsx | `Sheet` |
| PowerPoint | ppt, pptx | `Presentation` |
| CAD | dwg, dxf | `FileBox` |
| Text | txt, csv | `File` |
| Default | other | `File` |

---

## 8. Open Questions

1. **File storage strategy**: Should files be stored in `public/` (publicly accessible, no auth) or in a private directory with a download API that checks admin auth? Current proposal: public directory for simplicity. This means anyone with the URL can access the file.

2. **Existing inquiry migration**: Historical inquiries in the database have no `attachments` field. The schema change should default to `null`/empty array. No data migration needed — just handle `null` gracefully in the UI.

3. **Prisma generate constraint**: The codebase notes mention that `prisma generate` is currently blocked in the sandbox, and raw SQL queries are used for some models. Will the developer need to use `prisma.$executeRawUnsafe` for the `attachments` column, or can `prisma generate` be run?

4. **Multi-language labels**: The website supports 5 languages (EN/FR/DE/IT/ES) but the upload zone labels ("Drag & drop files here", "Attachments", "Max 5 files, 10MB each") are currently in English only. Should these be localized? The existing form fields (Name, Email, Phone, etc.) are also English-only, so this is consistent with current state. P2 for future localization.

5. **Spec-finder page integration (P2-4)**: Should the inquiry form on the spec-finder page be added as part of this feature, or as a separate task? The spec-finder page may not exist yet — need to confirm.

6. **File retention policy**: How long should uploaded files be kept? If an inquiry is marked as LOST, should attachments be deleted after a period? Currently no policy — files persist indefinitely.

7. **Notification on upload**: Should the sales team receive an email notification when an inquiry with attachments is submitted? Currently there's no email notification system visible in the codebase.
