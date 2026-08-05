'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Upload, Trash2, Loader2, ImageIcon } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MediaItem {
  id: number;
  filename: string;
  url: string;
  alt: string | null;
  category: string;
  fileSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  uploadedAt: string;
}

const CATEGORIES = ['all', 'product', 'banner', 'general', 'favicon', 'watermark', 'other'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryManager() {
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const queryParams = new URLSearchParams({
    pageSize: '24',
    page: String(page),
  });
  if (category !== 'all') queryParams.set('category', category);

  const { data, isLoading, mutate } = useSWR(`/api/admin/media-library?${queryParams.toString()}`, fetcher);
  const items: MediaItem[] = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category === 'all' ? 'general' : category);

      const res = await fetch('/api/admin/media-library', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.code === 201) {
        toast.success('Image uploaded');
        mutate();
      } else {
        toast.error(result.message || 'Failed to upload');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [category, mutate]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/media-library/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('Image deleted');
        mutate();
      } else {
        toast.error(result.message || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeletingId(null);
    }
  }, [mutate]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <label>
          <input type="file" className="hidden" onChange={handleUpload} accept="image/jpeg,image/png,image/webp,image/gif" />
          <Button variant="brand" asChild disabled={uploading}>
            <span>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload Image'}
            </span>
          </Button>
        </label>
      </div>

      <div className="mb-4 flex gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? 'brand' : 'outline'}
            size="sm"
            onClick={() => { setCategory(cat); setPage(1); }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{total} Images</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No images found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {items.map((item) => (
                  <div key={item.id} className="group relative overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.alt || item.filename}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-xs text-white">{item.filename}</p>
                      <p className="text-xs text-gray-300">{formatFileSize(item.fileSize)}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <Badge variant="outline" className="border-white/30 text-white">{item.category}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-white hover:bg-red-500/80"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
                  <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
