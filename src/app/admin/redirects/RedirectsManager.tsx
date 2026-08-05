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
      toast.error('Source URL and Target URL are required');
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
        toast.success(isEdit ? 'Redirect updated' : 'Redirect created');
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
    if (!confirm('Are you sure you want to delete this redirect?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/redirects/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('Redirect deleted');
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
        <h1 className="text-2xl font-bold text-gray-900">301 Redirects</h1>
        <Button variant="brand" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Redirect
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Source URL</label>
                <Input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="/old-page" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Target URL</label>
                <Input value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} placeholder="/new-page" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="rd-active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <label htmlFor="rd-active" className="text-sm">Active</label>
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
          <CardTitle>All Redirects ({redirects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : redirects.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No redirects yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source URL</TableHead>
                  <TableHead>Target URL</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirects.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.sourceUrl}</TableCell>
                    <TableCell className="font-mono text-sm text-brand-400">{item.targetUrl}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          title="Delete"
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
