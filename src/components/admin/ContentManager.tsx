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
        <TabsTrigger value="banners">横幅</TabsTrigger>
        <TabsTrigger value="pages">页面</TabsTrigger>
        <TabsTrigger value="testimonials">客户评价</TabsTrigger>
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
    if (!confirm('确认要删除此横幅吗？')) return;
    try {
      await fetch(`/api/admin/content/banners/${id}`, { method: 'DELETE' });
      toast.success('横幅删除成功');
      mutate();
    } catch {
      toast.error('删除横幅失败');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title || !editing.image) {
      toast.error('标题和图片不能为空');
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
      toast.success(isEdit ? '横幅更新成功' : '横幅创建成功');
      mutate();
      setDialogOpen(false);
    } else {
      toast.error(result.message || '保存横幅失败');
    }
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="brand" onClick={handleAdd}><Plus className="mr-2 h-4 w-4" />新建横幅</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {banners.length === 0 ? (
            <p className="py-8 text-center text-gray-400">暂无横幅。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>图片</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>已发布</TableHead>
                  <TableHead className="text-right">操作</TableHead>
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
                        {b.isPublished ? '是' : '否'}
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
          <DialogHeader><DialogTitle>{editing?.id ? '编辑横幅' : '新建横幅'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>标题 *</Label><Input value={editing?.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>副标题</Label><Input value={editing?.subtitle || ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
            <div><Label>图片 URL *</Label><Input value={editing?.image || ''} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></div>
            <div><Label>链接</Label><Input value={editing?.link || ''} onChange={(e) => setEditing({ ...editing, link: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>排序权重</Label><Input type="number" value={editing?.sortOrder ?? 0} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} /></div>
              <div>
                <Label>已发布</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={editing?.isPublished ? 'true' : 'false'} onChange={(e) => setEditing({ ...editing, isPublished: e.target.value === 'true' })}>
                  <option value="true">是</option>
                  <option value="false">否</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button variant="brand" onClick={handleSave}>保存</Button>
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
    if (!confirm('确认要删除此页面吗？')) return;
    try {
      await fetch(`/api/admin/content/pages/${id}`, { method: 'DELETE' });
      toast.success('页面删除成功');
      mutate();
    } catch {
      toast.error('删除页面失败');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.slug || !editing.title) {
      toast.error('Slug 和标题不能为空');
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
      toast.success(isEdit ? '页面更新成功' : '页面创建成功');
      mutate();
      setDialogOpen(false);
    } else {
      toast.error(result.message || '保存页面失败');
    }
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="brand" onClick={handleAdd}><Plus className="mr-2 h-4 w-4" />新建页面</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {pages.length === 0 ? (
            <p className="py-8 text-center text-gray-400">暂无内容页面。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>SEO 标题</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
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
          <DialogHeader><DialogTitle>{editing?.id ? '编辑页面' : '新建页面'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Slug *</Label><Input value={editing?.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="about, contact 等" disabled={Boolean(editing?.id)} /></div>
            <div><Label>标题 *</Label><Input value={editing?.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>内容 (HTML)</Label><Textarea rows={8} value={editing?.content || ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
            <div><Label>SEO 标题</Label><Input value={editing?.metaTitle || ''} onChange={(e) => setEditing({ ...editing, metaTitle: e.target.value })} /></div>
            <div><Label>SEO 描述</Label><Textarea rows={2} value={editing?.metaDescription || ''} onChange={(e) => setEditing({ ...editing, metaDescription: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button variant="brand" onClick={handleSave}>保存</Button>
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
    if (!confirm('确认要删除此评价吗？')) return;
    try {
      await fetch(`/api/admin/content/testimonials/${id}`, { method: 'DELETE' });
      toast.success('评价删除成功');
      mutate();
    } catch {
      toast.error('删除评价失败');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.customerName || !editing.content) {
      toast.error('客户姓名和内容不能为空');
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
      toast.success(isEdit ? '评价更新成功' : '评价创建成功');
      mutate();
      setDialogOpen(false);
    } else {
      toast.error(result.message || '保存评价失败');
    }
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="brand" onClick={handleAdd}><Plus className="mr-2 h-4 w-4" />新建评价</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {testimonials.length === 0 ? (
            <p className="py-8 text-center text-gray-400">暂无评价。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>客户</TableHead>
                  <TableHead>公司</TableHead>
                  <TableHead>国家</TableHead>
                  <TableHead>评分</TableHead>
                  <TableHead>已发布</TableHead>
                  <TableHead className="text-right">操作</TableHead>
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
                        {t.isPublished ? '是' : '否'}
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
          <DialogHeader><DialogTitle>{editing?.id ? '编辑评价' : '新建评价'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>客户姓名 *</Label><Input value={editing?.customerName || ''} onChange={(e) => setEditing({ ...editing, customerName: e.target.value })} /></div>
              <div><Label>公司</Label><Input value={editing?.company || ''} onChange={(e) => setEditing({ ...editing, company: e.target.value })} /></div>
              <div><Label>国家</Label><Input value={editing?.country || ''} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></div>
              <div><Label>评分 (1-5)</Label><Input type="number" min={1} max={5} value={editing?.rating ?? 5} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} /></div>
              <div><Label>排序权重</Label><Input type="number" value={editing?.sortOrder ?? 0} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} /></div>
              <div>
                <Label>已发布</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={editing?.isPublished ? 'true' : 'false'} onChange={(e) => setEditing({ ...editing, isPublished: e.target.value === 'true' })}>
                  <option value="true">是</option>
                  <option value="false">否</option>
                </select>
              </div>
            </div>
            <div><Label>内容 *</Label><Textarea rows={4} value={editing?.content || ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button variant="brand" onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
