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
import { Plus, Trash2, Pencil, Link2, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface FriendLinkItem {
  id: number;
  name: string;
  url: string;
  logo: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
}

export function FriendLinksManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', url: '', logo: '', sortOrder: 0, isVisible: true });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, mutate } = useSWR('/api/admin/friend-links', fetcher);
  const links: FriendLinkItem[] = data?.data?.items ?? [];

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setForm({ name: '', url: '', logo: '', sortOrder: 0, isVisible: true });
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((item: FriendLinkItem) => {
    setEditingId(item.id);
    setForm({ name: item.name, url: item.url, logo: item.logo || '', sortOrder: item.sortOrder, isVisible: item.isVisible });
    setShowForm(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim() || !form.url.trim()) {
      toast.error('名称和 URL 不能为空');
      return;
    }
    setSaving(true);
    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/admin/friend-links/${editingId}` : '/api/admin/friend-links';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.code === 200 || result.code === 201) {
        toast.success(isEdit ? '友情链接更新成功' : '友情链接创建成功');
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
    if (!confirm('确认要删除此友情链接吗？')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/friend-links/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('友情链接删除成功');
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
        <h1 className="text-2xl font-bold text-gray-900">友情链接</h1>
        <Button variant="brand" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新建链接
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">名称</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">URL</label>
                <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Logo URL（可选）</label>
                <Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="/images/..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">排序权重</label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="fl-visible" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} />
              <label htmlFor="fl-visible" className="text-sm">显示</label>
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
          <CardTitle>全部友情链接 ({links.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <p className="py-8 text-center text-gray-400">暂无友情链接。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="w-20">排序</TableHead>
                  <TableHead className="w-24">显示</TableHead>
                  <TableHead className="w-24 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-400 hover:underline">
                        <Link2 className="h-3 w-3" />
                        <span className="max-w-xs truncate text-sm">{item.url}</span>
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{item.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={item.isVisible ? 'default' : 'secondary'}>
                        {item.isVisible ? '是' : '否'}
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
