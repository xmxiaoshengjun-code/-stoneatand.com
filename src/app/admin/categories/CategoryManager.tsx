'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, ChevronRight, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface CategoryNode {
  id: number;
  name: string;
  nameCn: string | null;
  slug: string;
  prefix: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  sortOrder: number;
  children: CategoryNode[];
}

function flattenTree(nodes: CategoryNode[], depth = 0, result: Array<{ node: CategoryNode; depth: number }>[] = [[]]): Array<{ node: CategoryNode; depth: number }> {
  for (const node of nodes) {
    result[0].push({ node, depth });
    if (node.children.length > 0) {
      flattenTree(node.children, depth + 1, result);
    }
  }
  return result[0];
}

export function CategoryManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', prefix: '', parentId: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, mutate } = useSWR('/api/admin/categories', fetcher);
  const tree: CategoryNode[] = data?.data?.tree ?? [];
  const flatList = flattenTree(tree);

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setForm({ name: '', slug: '', prefix: '', parentId: '', description: '' });
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((node: CategoryNode) => {
    setEditingId(node.id);
    setForm({
      name: node.name,
      slug: node.slug,
      prefix: node.prefix,
      parentId: node.parentId ? String(node.parentId) : '',
      description: node.description || '',
    });
    setShowForm(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }
    setSaving(true);
    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';
      const body: Record<string, unknown> = {
        name: form.name,
        slug: form.slug,
        description: form.description,
      };
      if (form.prefix) body.prefix = form.prefix;
      if (form.parentId) body.parentId = parseInt(form.parentId, 10);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.code === 200 || result.code === 201) {
        toast.success(isEdit ? 'Category updated' : 'Category created');
        setShowForm(false);
        mutate();
      } else {
        toast.error(result.message || 'Failed to save');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }, [form, editingId, mutate]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? It must have no children and no products.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('Category deleted');
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
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button variant="brand" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. wall-sliding-rack" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Prefix</label>
                <Input value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} placeholder="e.g. WS" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Parent Category</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                >
                  <option value="">— Root Category —</option>
                  {flatList.map(({ node }) => (
                    <option key={node.id} value={node.id}>{node.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button variant="brand" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Category Tree ({flatList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : flatList.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No categories yet.</p>
          ) : (
            <div className="space-y-1">
              {flatList.map(({ node, depth }) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-gray-50"
                  style={{ marginLeft: `${depth * 24}px` }}
                >
                  <div className="flex items-center gap-2">
                    {depth > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                    <div>
                      <span className="font-medium text-gray-900">{node.name}</span>
                      <span className="ml-2 text-xs text-gray-500">/{node.slug}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{node.prefix}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(node)} title="Edit">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(node.id)}
                      disabled={deletingId === node.id}
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
