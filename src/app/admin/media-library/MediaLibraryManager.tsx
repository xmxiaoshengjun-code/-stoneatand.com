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

const CATEGORY_LABELS: Record<string, string> = {
  all: '全部',
  product: '产品',
  banner: '横幅',
  general: '通用',
  favicon: '图标',
  watermark: '水印',
  other: '其他',
};

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
        toast.success('图片上传成功');
        mutate();
      } else {
        toast.error(result.message || '上传失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [category, mutate]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('确认要删除此图片吗？')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/media-library/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('图片删除成功');
        mutate();
      } else {
        toast.error(result.message || '删除失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setDeletingId(null);
    }
  }, [mutate]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">媒体库</h1>
        <label>
          <input type="file" className="hidden" onChange={handleUpload} accept="image/jpeg,image/png,image/webp,image/gif" />
          <Button variant="brand" asChild disabled={uploading}>
            <span>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {uploading ? '上传中...' : '上传图片'}
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
            {CATEGORY_LABELS[cat] || cat}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{total} 张图片</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-gray-400">暂无图片。</p>
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
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
                  <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
