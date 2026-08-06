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
        toast.success(productId ? 'Product updated' : 'Product created');
        router.push('/admin/products');
      } else {
        toast.error(result.message || 'Failed to save product');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="sku">SKU *</Label>
            <Input id="sku" name="sku" required defaultValue={product?.sku as string} placeholder="CT-001" />
          </div>
          <div>
            <Label htmlFor="seriesId">Series *</Label>
            <Select name="seriesId" defaultValue={String(product?.seriesId || '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select series" />
              </SelectTrigger>
              <SelectContent>
                {seriesList.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" name="name" required defaultValue={product?.name as string} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={product?.description as string} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="standSize">Stand Size (mm)</Label>
            <Input id="standSize" name="standSize" defaultValue={product?.standSize as string} placeholder="1250×1500×2700" />
          </div>
          <div>
            <Label htmlFor="panelSize">Panel Size</Label>
            <Input id="panelSize" name="panelSize" defaultValue={product?.panelSize as string} placeholder="1200×2400" />
          </div>
          <div>
            <Label htmlFor="panelThickness">Panel Thickness</Label>
            <Input id="panelThickness" name="panelThickness" defaultValue={product?.panelThickness as string} placeholder="15mm" />
          </div>
          <div>
            <Label htmlFor="packageSize">Package Size (mm)</Label>
            <Input id="packageSize" name="packageSize" defaultValue={product?.packageSize as string} placeholder="2750×1550×950" />
          </div>
          <div>
            <Label htmlFor="numberOfPanel">Number of Panels</Label>
            <Input id="numberOfPanel" name="numberOfPanel" type="number" defaultValue={product?.numberOfPanel as string} />
          </div>
          <div>
            <Label htmlFor="weight">Weight</Label>
            <Input id="weight" name="weight" defaultValue={product?.weight as string} />
          </div>
          <div>
            <Label htmlFor="material">Material</Label>
            <Input id="material" name="material" defaultValue={product?.material as string} />
          </div>
          <div>
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={product?.sortOrder as string || '0'} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="features">Features</Label>
            <Textarea id="features" name="features" rows={2} defaultValue={product?.features as string} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="isFeatured" name="isFeatured" defaultChecked={product?.isFeatured as boolean} />
            <Label htmlFor="isFeatured">Featured product (shown on homepage)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="isPublished" name="isPublished" defaultChecked={product?.isPublished !== false} />
            <Label htmlFor="isPublished">Published (visible on website)</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="brand" disabled={loading}>
          {loading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
