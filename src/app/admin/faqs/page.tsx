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
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { FaqEditor, type FaqFormData } from './FaqEditor';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminFaqsPage() {
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqFormData | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, mutate } = useSWR('/api/admin/faqs?pageSize=200', fetcher);

  const faqs: Array<Record<string, unknown>> = data?.data?.items ?? [];

  const filteredFaqs = search
    ? faqs.filter(
        (f) =>
          (f.question as string)?.toLowerCase().includes(search.toLowerCase()) ||
          (f.category as string)?.toLowerCase().includes(search.toLowerCase())
      )
    : faqs;

  const handleAdd = useCallback(() => {
    setEditingFaq(null);
    setEditorOpen(true);
  }, []);

  const handleEdit = useCallback((faq: Record<string, unknown>) => {
    setEditingFaq({
      id: faq.id as number,
      category: faq.category as string,
      question: faq.question as string,
      answer: faq.answer as string,
      keywords: (faq.keywords as string) || '',
      sortOrder: (faq.sortOrder as number) || 0,
    });
    setEditorOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.code === 200) {
        toast.success('FAQ deleted');
        mutate();
      } else {
        toast.error(data.message || 'Failed to delete FAQ');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeletingId(null);
    }
  }, [mutate]);

  const handleSaved = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
        <Button variant="brand" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All FAQs ({filteredFaqs.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search FAQs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filteredFaqs.length === 0 ? (
            <p className="py-8 text-center text-gray-400">
              {search ? 'No FAQs match your search.' : 'No FAQs yet. Click "Add FAQ" to create one.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="w-32">Category</TableHead>
                  <TableHead className="w-32">Keywords</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaqs.map((faq) => (
                  <TableRow key={faq.id as number}>
                    <TableCell className="text-sm text-gray-500">{faq.sortOrder as number}</TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{faq.question as string}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-gray-500">{faq.answer as string}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{faq.category as string}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {(faq.keywords as string) || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(faq)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(faq.id as number)}
                          disabled={deletingId === faq.id}
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

      <FaqEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSaved={handleSaved}
        initialData={editingFaq}
      />
    </div>
  );
}
