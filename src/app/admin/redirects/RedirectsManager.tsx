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
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface RedirectItem {
  id: number;
  sourceUrl: string;
  targetUrl: string;
  isActive: boolean;
  createdAt: string;
}

export function RedirectsManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ sourceUrl: '', targetUrl: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, mutate } = useSWR('/api/admin/redirects', fetcher);
  const redirects: RedirectItem[] = data?.data?.items ?? [];

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setForm({ sourceUrl: '', targetUrl: '', isActive: true });
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((item: RedirectItem) => {
    setEditingId(item.id);
    setForm({ sourceUrl: item.sourceUrl, targetUrl: item.targetUrl, isActive: item.isActive });
    setShowForm(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.sourceUrl.trim() || !form.targetUrl.trim()) {
      toast.error('源 URL 和目标 URL 不能为空');
      return;
    }
    setSaving(true);
    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/admin/redirects/${editingId}` : '/api/admin/redirects';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.code === 200 || result.code === 201) {
        toast.success(isEdit ? '重定向规则更新成功' : '重定向规则创建成功');
        setShowForm(false);
        mutate();
      } else {
        toast.error(result.message || '保存失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setSaving(false);
    }
  }, [form, editingId, mutate]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('确认要删除此重定向规则吗？')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/redirects/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('重定向规则删除成功');
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
        <h1 className="text-2xl font-bold text-gray-900">301 重定向规则</h1>
        <Button variant="brand" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新建规则
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">源 URL</label>
                <Input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="/old-page" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">目标 URL</label>
                <Input value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} placeholder="/new-page" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="rd-active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <label htmlFor="rd-active" className="text-sm">启用</label>
            </div>
            <div className="flex gap-2">
              <Button variant="brand" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {saving ? '保存中...' : '保存'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>取消</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>全部重定向规则 ({redirects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : redirects.length === 0 ? (
            <p className="py-8 text-center text-gray-400">暂无重定向规则。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>源 URL</TableHead>
                  <TableHead>目标 URL</TableHead>
                  <TableHead className="w-24">状态</TableHead>
                  <TableHead className="w-24 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirects.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.sourceUrl}</TableCell>
                    <TableCell className="font-mono text-sm text-brand-400">{item.targetUrl}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>
                        {item.isActive ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
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
