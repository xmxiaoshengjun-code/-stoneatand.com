'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, FileText, File, Loader2, Paperclip } from 'lucide-react';
import type { Attachment, FileCategory } from '@/types/attachment';
import {
  MAX_FILE_SIZE,
  MAX_FILE_COUNT,
  isAllowedExtension,
  categorizeFileType,
} from '@/lib/validations/upload';
import { getFileExtension, formatFileSize } from '@/lib/utils/file';

/**
 * Internal state for tracking each file's upload progress.
 */
interface UploadState {
  /** The original File object from the input. */
  file: File;
  /** Upload progress 0–100, or null if not yet started. */
  progress: number | null;
  /** Whether this file is currently uploading. */
  uploading: boolean;
  /** Error message if upload failed, null otherwise. */
  error: string | null;
}

/**
 * Maps a file category to the appropriate lucide-react icon component.
 */
function getCategoryIcon(category: FileCategory) {
  switch (category) {
    case 'image':
      return ImageIcon;
    case 'document':
      return FileText;
    case 'cad':
      return File;
    default:
      return File;
  }
}

interface FileUploadZoneProps {
  /** Current list of successfully uploaded attachments. */
  attachments: Attachment[];
  /** Callback invoked when the attachment list changes. */
  onChange: (attachments: Attachment[]) => void;
  /** Maximum number of files allowed (default: 5). */
  maxFiles?: number;
}

/**
 * FileUploadZone — drag-and-drop + click-to-browse file upload component.
 *
 * Allows website visitors to attach up to `maxFiles` files to their inquiry.
 * Files are validated client-side (type + size) before being uploaded to
 * `/api/uploads/inquiry`. Each file shows its upload progress and can be
 * removed before form submission.
 *
 * @param attachments - Current attachments array (controlled component).
 * @param onChange - Callback to update the parent's attachments state.
 * @param maxFiles - Maximum allowed files (default 5).
 */
export function FileUploadZone({
  attachments,
  onChange,
  maxFiles = MAX_FILE_COUNT,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  /**
   * Removes an attachment and its corresponding upload state.
   */
  const removeAttachment = useCallback(
    (index: number) => {
      const newAttachments = attachments.filter((_, i) => i !== index);
      onChange(newAttachments);
      setUploadStates((prev) => prev.filter((_, i) => i !== index));
    },
    [attachments, onChange]
  );

  /**
   * Uploads a single file to the server via XMLHttpRequest for progress tracking.
   * Returns a promise that resolves to the uploaded Attachment or rejects on error.
   */
  const uploadFile = useCallback(
    (file: File, stateIndex: number): Promise<Attachment> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);

        // Track upload progress
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadStates((prev) => {
              const next = [...prev];
              if (next[stateIndex]) {
                next[stateIndex] = { ...next[stateIndex], progress: percent };
              }
              return next;
            });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.code === 200 && response.data) {
                resolve(response.data as Attachment);
              } else {
                reject(new Error(response.message || 'Upload failed'));
              }
            } catch {
              reject(new Error('Invalid server response'));
            }
          } else {
            try {
              const response = JSON.parse(xhr.responseText);
              reject(new Error(response.message || `Upload failed (${xhr.status})`));
            } catch {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };

        xhr.open('POST', '/api/uploads/inquiry');
        xhr.send(formData);
      });
    },
    []
  );

  /**
   * Processes an array of selected files: validates, uploads, and updates state.
   */
  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const currentCount = attachments.length + uploadStates.filter((s) => s.uploading).length;
      const remainingSlots = maxFiles - currentCount;

      if (remainingSlots <= 0) {
        toast.error(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      const filesToProcess = Array.from(fileList).slice(0, remainingSlots);
      const skippedFiles: string[] = [];

      // Validate each file client-side
      const validFiles: File[] = [];
      for (const file of filesToProcess) {
        const ext = getFileExtension(file.name);

        if (!ext || !isAllowedExtension(ext)) {
          skippedFiles.push(`${file.name} (unsupported type)`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          skippedFiles.push(`${file.name} (exceeds ${formatFileSize(MAX_FILE_SIZE)})`);
          continue;
        }

        if (file.size === 0) {
          skippedFiles.push(`${file.name} (empty file)`);
          continue;
        }

        validFiles.push(file);
      }

      if (skippedFiles.length > 0) {
        toast.error(`Skipped: ${skippedFiles.join(', ')}`);
      }

      if (validFiles.length === 0) return;

      // Add upload states for each valid file
      const startIndex = uploadStates.length;
      const newStates: UploadState[] = validFiles.map((file) => ({
        file,
        progress: null,
        uploading: true,
        error: null,
      }));
      setUploadStates((prev) => [...prev, ...newStates]);

      // Upload each file sequentially to avoid overwhelming the server
      const newAttachments: Attachment[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        const stateIndex = startIndex + i;
        try {
          const attachment = await uploadFile(validFiles[i], stateIndex);
          newAttachments.push(attachment);

          // Mark as done
          setUploadStates((prev) => {
            const next = [...prev];
            if (next[stateIndex]) {
              next[stateIndex] = {
                ...next[stateIndex],
                uploading: false,
                progress: 100,
              };
            }
            return next;
          });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Upload failed';
          toast.error(`Failed to upload ${validFiles[i].name}: ${errorMsg}`);

          // Mark as error
          setUploadStates((prev) => {
            const next = [...prev];
            if (next[stateIndex]) {
              next[stateIndex] = {
                ...next[stateIndex],
                uploading: false,
                error: errorMsg,
              };
            }
            return next;
          });
        }
      }

      // Add successfully uploaded attachments to the parent state
      if (newAttachments.length > 0) {
        onChange([...attachments, ...newAttachments]);
      }
    },
    [attachments, uploadStates, maxFiles, onChange, uploadFile]
  );

  /**
   * Retries uploading a failed file.
   */
  const handleRetry = useCallback(
    async (stateIndex: number) => {
      const state = uploadStates[stateIndex];
      if (!state) return;

      setUploadStates((prev) => {
        const next = [...prev];
        next[stateIndex] = { ...next[stateIndex], uploading: true, error: null, progress: null };
        return next;
      });

      try {
        const attachment = await uploadFile(state.file, stateIndex);
        onChange([...attachments, attachment]);

        setUploadStates((prev) => {
          const next = [...prev];
          next[stateIndex] = {
            ...next[stateIndex],
            uploading: false,
            progress: 100,
          };
          return next;
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        toast.error(`Retry failed: ${errorMsg}`);

        setUploadStates((prev) => {
          const next = [...prev];
          next[stateIndex] = {
            ...next[stateIndex],
            uploading: false,
            error: errorMsg,
          };
          return next;
        });
      }
    },
    [uploadStates, attachments, onChange, uploadFile]
  );

  // --- Drag and drop handlers ---
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input so the same file can be selected again
      e.target.value = '';
    },
    [handleFiles]
  );

  // Combine completed attachments and in-progress uploads for display
  const remainingSlots = maxFiles - attachments.length;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {remainingSlots > 0 && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            flex cursor-pointer flex-col items-center justify-center
            rounded-lg border-2 border-dashed p-6 text-center transition-colors
            ${isDragging
              ? 'border-brand-400 bg-brand-50'
              : 'border-gray-300 hover:border-brand-300 hover:bg-gray-50'
            }
          `}
        >
          <Upload className="mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">
            Drag files here or click to browse
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Max {maxFiles} files, up to {formatFileSize(MAX_FILE_SIZE)} each
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            Images, PDF, Word, Excel, CAD (.dwg/.dxf), TXT, CSV
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.dxf,.txt,.csv"
          />
        </div>
      )}

      {/* File list: completed attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => {
            const Icon = getCategoryIcon(attachment.fileCategory);
            return (
              <div
                key={`${attachment.url}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gray-100">
                  {attachment.fileCategory === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={attachment.url}
                      alt={attachment.fileName}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <Icon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-700">
                    {attachment.fileName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(attachment.fileSize)} · {attachment.fileType.toUpperCase()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="flex-shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                  aria-label={`Remove ${attachment.fileName}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* File list: uploading / failed files */}
      {uploadStates.some((s) => s.uploading || s.error) && (
        <div className="space-y-2">
          {uploadStates.map((state, index) => {
            if (!state.uploading && !state.error) return null;
            const ext = getFileExtension(state.file.name);
            const Icon = getCategoryIcon(categorizeFileType(ext));
            return (
              <div
                key={`upload-${index}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gray-100">
                  {state.uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                  ) : state.error ? (
                    <Icon className="h-5 w-5 text-red-400" />
                  ) : (
                    <Icon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-700">
                    {state.file.name}
                  </p>
                  {state.uploading && state.progress !== null && (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-brand-400 transition-all duration-200"
                        style={{ width: `${state.progress}%` }}
                      />
                    </div>
                  )}
                  {state.uploading && state.progress === null && (
                    <p className="text-xs text-gray-400">Starting upload...</p>
                  )}
                  {state.error && (
                    <p className="text-xs text-red-500">{state.error}</p>
                  )}
                </div>
                {state.error && (
                  <button
                    type="button"
                    onClick={() => handleRetry(index)}
                    className="flex-shrink-0 rounded-md px-2 py-1 text-xs font-medium text-brand-400 transition-colors hover:bg-brand-50"
                  >
                    Retry
                  </button>
                )}
                {state.uploading && (
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="flex-shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                    aria-label="Cancel upload"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary indicator */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Paperclip className="h-3 w-3" />
          <span>
            {attachments.length} / {maxFiles} files attached
          </span>
        </div>
      )}
    </div>
  );
}
