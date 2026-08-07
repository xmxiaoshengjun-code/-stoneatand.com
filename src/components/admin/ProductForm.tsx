'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { SERIES_INFO } from '@/lib/constants/series';

export function ProductForm({ productId }: { productId?: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [seriesList, setSeriesList] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    // Fetch series tree from categories API (includes parent + leaf series)
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => {
        const tree = data?.data?.tree ?? [];
        if (tree.length > 0) {
          // Build flat list: parents first, then their children
          const flat: Array<{ id: number; name: string }> = [];
          for (const parent of tree) {
            flat.push({ id: parent.id, name: parent.name });
            for (const child of parent.children ?? []) {
              flat.push({ id: child.id, name: `  └ ${child.name}` });
            }
          }
          setSeriesList(flat);
        } else {
          // Fallback to SERIES_INFO constants
          setSeriesList(SERIES_INFO.map((s, i) => ({ id: i + 1, name: s.name })));
        }
      })
      .catch(() => {
        setSeriesList(SERIES_INFO.map((s, i) => ({ id: i + 1, name: s.name })));
      });

    if (productId) {
      fetch(`/api/admin/products/${productId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.code === 200) {
            setProduct(data.data);
          }
        });
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      sku: formData.get('sku'),
      seriesId: Number(formData.get('seriesId')),
      name: formData.get('name'),
      description: formData.get('description') || null,
      standSize: formData.get('standSize') || null,
      panelSize: formData.get('panelSize') || null,
      panelThickness: formData.get('panelThickness') || null,
      packageSize: formData.get('packageSize') || null,
      numberOfPanel: formData.get('numberOfPanel') ? Number(formData.get('numberOfPanel')) : null,
      weight: formData.get('weight') || null,
      material: formData.get('material') || null,
      features: formData.get('features') || null,
      isFeatured: formData.get('isFeatured') === 'on',
      isPublished: formData.get('isPublished') === 'on',
      sortOrder: Number(formData.get('sortOrder')) || 0,
    };

    try {
      const url = productId ? `/api/admin/products/${productId}` : '/api/admin/products';
      const method = productId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.code === 200 || result.code === 201) {
        toast.success(productId ? '产品更新成功' : '产品创建成功');
        router.push('/admin/products');
      } else {
        toast.error(result.message || '保存产品失败');
      }
    } catch {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="sku">SKU *</Label>
            <Input id="sku" name="sku" required defaultValue={product?.sku as string} placeholder="CT-001" />
          </div>
          <div>
            <Label htmlFor="seriesId">系列 *</Label>
            <Select name="seriesId" defaultValue={String(product?.seriesId || '')}>
              <SelectTrigger>
                <SelectValue placeholder="请选择系列" />
              </SelectTrigger>
              <SelectContent>
                {seriesList.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="name">产品名称 *</Label>
            <Input id="name" name="name" required defaultValue={product?.name as string} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">描述</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={product?.description as string} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>规格参数</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="standSize">展架尺寸 (mm)</Label>
            <Input id="standSize" name="standSize" defaultValue={product?.standSize as string} placeholder="1250×1500×2700" />
          </div>
          <div>
            <Label htmlFor="panelSize">面板尺寸</Label>
            <Input id="panelSize" name="panelSize" defaultValue={product?.panelSize as string} placeholder="1200×2400" />
          </div>
          <div>
            <Label htmlFor="panelThickness">面板厚度</Label>
            <Input id="panelThickness" name="panelThickness" defaultValue={product?.panelThickness as string} placeholder="15mm" />
          </div>
          <div>
            <Label htmlFor="packageSize">包装尺寸 (mm)</Label>
            <Input id="packageSize" name="packageSize" defaultValue={product?.packageSize as string} placeholder="2750×1550×950" />
          </div>
          <div>
            <Label htmlFor="numberOfPanel">面板数量</Label>
            <Input id="numberOfPanel" name="numberOfPanel" type="number" defaultValue={product?.numberOfPanel as string} />
          </div>
          <div>
            <Label htmlFor="weight">重量</Label>
            <Input id="weight" name="weight" defaultValue={product?.weight as string} />
          </div>
          <div>
            <Label htmlFor="material">材质</Label>
            <Input id="material" name="material" defaultValue={product?.material as string} />
          </div>
          <div>
            <Label htmlFor="sortOrder">排序权重</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={product?.sortOrder as string || '0'} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="features">特点</Label>
            <Textarea id="features" name="features" rows={2} defaultValue={product?.features as string} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>显示设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="isFeatured" name="isFeatured" defaultChecked={product?.isFeatured as boolean} />
            <Label htmlFor="isFeatured">精选产品（显示在首页）</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="isPublished" name="isPublished" defaultChecked={product?.isPublished !== false} />
            <Label htmlFor="isPublished">已发布（在网站上可见）</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="brand" disabled={loading}>
          {loading ? '保存中...' : productId ? '更新产品' : '创建产品'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
          取消
        </Button>
      </div>
    </form>
  );
}
