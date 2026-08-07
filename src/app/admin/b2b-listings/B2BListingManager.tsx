'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, ExternalLink, Copy } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface B2BListingItem {
  id: number;
  productId: number;
  platformName: string;
  listingUrl: string | null;
  generatedContent: string | null;
  exportFormat: string | null;
  status: string;
  createdAt: string;
}

interface ProductOption {
  id: number;
  sku: string;
  name: string;
}

const PLATFORMS = [
  { value: 'alibaba', label: 'Alibaba' },
  { value: 'made-in-china', label: 'Made-in-China' },
  { value: 'global-sources', label: 'Global Sources' },
  { value: 'custom', label: 'Custom' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'secondary',
  published: 'default',
  updated: 'default',
  archived: 'secondary',
};

export function B2BListingManager() {
  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState('');
  const [platformName, setPlatformName] = useState('alibaba');
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingContent, setViewingContent] = useState<B2BListingItem | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const { data: listingsData, isLoading, mutate } = useSWR('/api/admin/b2b-listings', fetcher);
  const { data: productsData } = useSWR('/api/admin/products?pageSize=200', fetcher);

  const listings: B2BListingItem[] = listingsData?.data?.items ?? [];
  const products: ProductOption[] = productsData?.data?.items ?? [];

  const handleGenerate = useCallback(async () => {
    if (!productId) {
      toast.error('请选择产品');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/b2b-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: parseInt(productId, 10), platformName }),
      });
      const result = await res.json();
      if (result.code === 201) {
        toast.success('B2B 铺货生成成功');
        setShowForm(false);
        setProductId('');
        mutate();
      } else {
        toast.error(result.message || '生成失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setGenerating(false);
    }
  }, [productId, platformName, mutate]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('确认要删除此铺货信息吗？')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/b2b-listings/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('铺货信息删除成功');
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

  const handleStatusChange = useCallback(async (id: number, status: string) => {
    setUpdatingStatus(id);
    try {
      const res = await fetch(`/api/admin/b2b-listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('状态更新成功');
        mutate();
      } else {
        toast.error(result.message || '更新失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setUpdatingStatus(null);
    }
  }, [mutate]);

  const handleCopyContent = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success('内容已复制到剪贴板');
    }).catch(() => {
      toast.error('复制失败');
    });
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">B2B 铺货</h1>
        <Button variant="brand" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          生成铺货信息
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全部 B2B 铺货 ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <p className="py-8 text-center text-gray-400">暂无 B2B 铺货信息。点击"生成铺货信息"创建一个。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>产品 ID</TableHead>
                  <TableHead>平台</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="w-32 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">#{item.productId}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.platformName}</Badge>
                    </TableCell>
                    <TableCell>
                      <select
                        className="h-8 rounded border px-2 text-sm"
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        disabled={updatingStatus === item.id}
                      >
                        <option value="draft">草稿</option>
                        <option value="published">已发布</option>
                        <option value="updated">已更新</option>
                        <option value="archived">已归档</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      {item.listingUrl ? (
                        <a href={item.listingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-400 hover:underline">
                          <ExternalLink className="h-3 w-3" />
                          <span className="max-w-xs truncate text-sm">{item.listingUrl}</span>
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setViewingContent(item)} title="查看内容">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          title="删除"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Generate Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>生成 B2B 铺货信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">产品</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">请选择产品...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">平台</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>取消</Button>
            <Button variant="brand" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {generating ? '生成中...' : '生成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Viewer Dialog */}
      <Dialog open={!!viewingContent} onOpenChange={() => setViewingContent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>生成的内容</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <Textarea
              readOnly
              rows={16}
              value={viewingContent?.generatedContent || ''}
              className="font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="brand" onClick={() => viewingContent && handleCopyContent(viewingContent.generatedContent || '')}>
              <Copy className="mr-2 h-4 w-4" />
              复制到剪贴板
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
