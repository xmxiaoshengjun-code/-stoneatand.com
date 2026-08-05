'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ContentManager() {
  return (
    <Tabs defaultValue="banners">
      <TabsList>
        <TabsTrigger value="banners">Banners</TabsTrigger>
        <TabsTrigger value="pages">Pages</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
      </TabsList>

      <TabsContent value="banners">
        <BannerManager />
      </TabsContent>

      <TabsContent value="pages">
        <PageManager />
      </TabsContent>

      <TabsContent value="testimonials">
        <TestimonialManager />
      </TabsContent>
    </Tabs>
  );
}

// ==================== Banner Manager ====================

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  sortOrder: number;
  isPublished: boolean;
}

function BannerManager() {
  const { data, isLoading, mutate } = useSWR('/api/admin/content/banners', fetcher);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const banners: Banner[] = data?.data ?? [];

  const handleAdd = () => {
    setEditing({ title: '', subtitle: '', image: '', link: '', sortOrder: 0, isPublished: true });
    setDialogOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditing(banner);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await fetch(`/api/admin/content/banners/${id}`, { method: 'DELETE' });
      toast.success('Banner deleted');
      mutate();
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title || !editing.image) {
      toast.error('Title and image are required');
      return;
    }
    const isEdit = Boolean(editing.id);
    const url = isEdit ? `/api/admin/content/banners/${editing.id}` : '/api/admin/content/banners';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    const result = await res.json();
    if (result.code === 200 || result.code === 201) {
      toast.success(isEdit ? 'Banner updated' : 'Banner created');
      mutate();
      setDialogOpen(false);
    } else {
      toast.error(result.message || 'Failed to save banner');
    }
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="brand" onClick={handleAdd}><Plus className="mr-2 h-4 w-4" />Add Banner</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {banners.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No banners yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <img src={b.image} alt={b.title} className="h-10 w-16 rounded object-cover" />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{b.title}</p>
                      {b.subtitle && <p className="text-sm text-gray-500">{b.subtitle}</p>}
                    </TableCell>
                    <TableCell>{b.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={b.isPublished ? 'default' : 'secondary'}>
                        {b.isPublished ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(b)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="text-red-500">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? 'Edit Banner' : 'New Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={editing?.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>Subtitle</Label><Input value={editing?.subtitle || ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
            <div><Label>Image URL *</Label><Input value={editing?.image || ''} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></div>
            <div><Label>Link</Label><Input value={editing?.link || ''} onChange={(e) => setEditing({ ...editing, link: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Sort Order</Label><Input type="number" value={editing?.sortOrder ?? 0} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} /></div>
              <div>
                <Label>Published</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={editing?.isPublished ? 'true' : 'false'} onChange={(e) => setEditing({ ...editing, isPublished: e.target.value === 'true' })}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="brand" onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== Page Manager ====================

interface ContentPageItem {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
}

function PageManager() {
  const { data, isLoading, mutate } = useSWR('/api/admin/content/pages', fetcher);
  const [editing, setEditing] = useState<Partial<ContentPageItem> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pages: ContentPageItem[] = data?.data ?? [];

  const handleAdd = () => {
    setEditing({ slug: '', title: '', content: '', metaTitle: '', metaDescription: '' });
    setDialogOpen(true);
  };

  const handleEdit = (page: ContentPageItem) => {
    setEditing(page);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this page?')) return;
    try {
      await fetch(`/api/admin/content/pages/${id}`, { method: 'DELETE' });
      toast.success('Page deleted');
      mutate();
    } catch {
      toast.error('Failed to delete page');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.slug || !editing.title) {
      toast.error('Slug and title are required');
      return;
    }
    const isEdit = Boolean(editing.id);
    const url = isEdit ? `/api/admin/content/pages/${editing.id}` : '/api/admin/content/pages';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    const result = await res.json();
    if (result.code === 200 || result.code === 201) {
      toast.success(isEdit ? 'Page updated' : 'Page created');
      mutate();
      setDialogOpen(false);
    } else {
      toast.error(result.message || 'Failed to save page');
    }
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="brand" onClick={handleAdd}><Plus className="mr-2 h-4 w-4" />Add Page</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {pages.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No content pages yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Meta Title</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.slug}</TableCell>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="text-sm text-gray-500">{p.metaTitle || '-'}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-red-500">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? 'Edit Page' : 'New Page'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Slug *</Label><Input value={editing?.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="about, contact, etc." disabled={Boolean(editing?.id)} /></div>
            <div><Label>Title *</Label><Input value={editing?.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>Content (HTML)</Label><Textarea rows={8} value={editing?.content || ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
            <div><Label>Meta Title</Label><Input value={editing?.metaTitle || ''} onChange={(e) => setEditing({ ...editing, metaTitle: e.target.value })} /></div>
            <div><Label>Meta Description</Label><Textarea rows={2} value={editing?.metaDescription || ''} onChange={(e) => setEditing({ ...editing, metaDescription: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="brand" onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== Testimonial Manager ====================

interface Testimonial {
  id: number;
  customerName: string;
  company: string | null;
  country: string | null;
  rating: number;
  content: string;
  isPublished: boolean;
  sortOrder: number;
}

function TestimonialManager() {
  const { data, isLoading, mutate } = useSWR('/api/admin/content/testimonials', fetcher);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const testimonials: Testimonial[] = data?.data ?? [];

  const handleAdd = () => {
    setEditing({ customerName: '', company: '', country: '', rating: 5, content: '', isPublished: true, sortOrder: 0 });
    setDialogOpen(true);
  };

  const handleEdit = (t: Testimonial) => {
    setEditing(t);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await fetch(`/api/admin/content/testimonials/${id}`, { method: 'DELETE' });
      toast.success('Testimonial deleted');
      mutate();
    } catch {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.customerName || !editing.content) {
      toast.error('Customer name and content are required');
      return;
    }
    const isEdit = Boolean(editing.id);
    const url = isEdit ? `/api/admin/content/testimonials/${editing.id}` : '/api/admin/content/testimonials';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    const result = await res.json();
    if (result.code === 200 || result.code === 201) {
      toast.success(isEdit ? 'Testimonial updated' : 'Testimonial created');
      mutate();
      setDialogOpen(false);
    } else {
      toast.error(result.message || 'Failed to save testimonial');
    }
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="brand" onClick={handleAdd}><Plus className="mr-2 h-4 w-4" />Add Testimonial</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {testimonials.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No testimonials yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <p className="font-medium">{t.customerName}</p>
                      <p className="line-clamp-1 text-sm text-gray-500">{t.content}</p>
                    </TableCell>
                    <TableCell>{t.company || '-'}</TableCell>
                    <TableCell>{t.country || '-'}</TableCell>
                    <TableCell>{'⭐'.repeat(t.rating)}</TableCell>
                    <TableCell>
                      <Badge variant={t.isPublished ? 'default' : 'secondary'}>
                        {t.isPublished ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-red-500">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? 'Edit Testimonial' : 'New Testimonial'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Customer Name *</Label><Input value={editing?.customerName || ''} onChange={(e) => setEditing({ ...editing, customerName: e.target.value })} /></div>
              <div><Label>Company</Label><Input value={editing?.company || ''} onChange={(e) => setEditing({ ...editing, company: e.target.value })} /></div>
              <div><Label>Country</Label><Input value={editing?.country || ''} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></div>
              <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={editing?.rating ?? 5} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} /></div>
              <div><Label>Sort Order</Label><Input type="number" value={editing?.sortOrder ?? 0} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} /></div>
              <div>
                <Label>Published</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={editing?.isPublished ? 'true' : 'false'} onChange={(e) => setEditing({ ...editing, isPublished: e.target.value === 'true' })}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div><Label>Content *</Label><Textarea rows={4} value={editing?.content || ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="brand" onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
