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
      const title = prompt('Enter a title for this download:', file.name);
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
        toast.success('Download created');
        mutate();
      } else {
        toast.error(result.message || 'Failed to create download');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [mutate]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this download? The file will also be removed.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/downloads/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.code === 200) {
        toast.success('Download deleted');
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
        toast.success('Download updated');
        setEditingId(null);
        mutate();
      } else {
        toast.error(result.message || 'Failed to update');
      }
    } catch {
      toast.error('Network error');
    }
  }, [editingId, editForm, mutate]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Downloads Management</h1>
        <label>
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" />
          <Button variant="brand" asChild disabled={uploading}>
            <span>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload File'}
            </span>
          </Button>
        </label>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Downloads ({downloads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : downloads.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No downloads yet. Click "Upload File" to add one.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-32">Category</TableHead>
                  <TableHead className="w-24">Size</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
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
                          <option value="catalog">Catalog</option>
                          <option value="specification">Specification</option>
                          <option value="manual">Manual</option>
                          <option value="certificate">Certificate</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <Badge variant="outline">{item.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{formatFileSize(item.fileSize)}</TableCell>
                    <TableCell>
                      <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                        {item.isPublished ? 'Published' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {editingId === item.id ? (
                          <>
                            <Button variant="brand" size="sm" onClick={handleSaveEdit}>Save</Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <>
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
