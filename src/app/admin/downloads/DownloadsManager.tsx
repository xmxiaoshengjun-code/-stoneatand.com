'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Upload, Trash2, FileText, Pencil, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface DownloadItem {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DownloadsManager() {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<DownloadItem>>({});

  const { data, isLoading, mutate } = useSWR('/api/admin/downloads?pageSize=100', fetcher);
  const downloads: DownloadItem[] = data?.data?.items ?? [];

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const title = prompt('请输入此下载文件的标题：', file.name);
      if (!title) {
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', 'other');

      const res = await fetch('/api/admin/downloads', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.code === 201) {
        toast.success('下载文件创建成功');
        mutate();
      } else {
        toast.error(result.message || '创建下载文件失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [mutate]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('确认要删除此下载文件吗？文件也会被一并删除。')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/downloads/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('下载文件删除成功');
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

  const handleEdit = useCallback((item: DownloadItem) => {
    setEditingId(item.id);
    setEditForm({ title: item.title, description: item.description || '', category: item.category, sortOrder: item.sortOrder, isPublished: item.isPublished });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/admin/downloads/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('下载文件更新成功');
        setEditingId(null);
        mutate();
      } else {
        toast.error(result.message || '更新失败');
      }
    } catch {
      toast.error('网络错误');
    }
  }, [editingId, editForm, mutate]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">下载中心管理</h1>
        <label>
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" />
          <Button variant="brand" asChild disabled={uploading}>
            <span>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {uploading ? '上传中...' : '上传文件'}
            </span>
          </Button>
        </label>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全部下载文件 ({downloads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : downloads.length === 0 ? (
            <p className="py-8 text-center text-gray-400">暂无下载文件。点击"上传文件"添加。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead className="w-32">分类</TableHead>
                  <TableHead className="w-24">大小</TableHead>
                  <TableHead className="w-24">状态</TableHead>
                  <TableHead className="w-24 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {downloads.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.fileName}</p>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <select
                          className="h-8 rounded border px-2 text-sm"
                          value={editForm.category || 'other'}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        >
                          <option value="catalog">产品目录</option>
                          <option value="specification">规格说明</option>
                          <option value="manual">使用手册</option>
                          <option value="certificate">证书</option>
                          <option value="other">其他</option>
                        </select>
                      ) : (
                        <Badge variant="outline">{item.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{formatFileSize(item.fileSize)}</TableCell>
                    <TableCell>
                      <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                        {item.isPublished ? '已发布' : '隐藏'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {editingId === item.id ? (
                          <>
                            <Button variant="brand" size="sm" onClick={handleSaveEdit}>保存</Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>取消</Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="编辑">
                              <Pencil className="h-4 w-4" />
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
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
