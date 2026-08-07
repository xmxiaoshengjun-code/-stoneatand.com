'use client';

import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useCompare } from '@/hooks/useCompare';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizePath } from '@/lib/i18n/config';
import { buildProductDetailPath } from '@/lib/constants/series';
import type { Product } from '@/types/product';

export function CompareTable({ products }: { products: Product[] }) {
  const { removeProduct } = useCompare();
  const { locale } = useI18n();
  const lh = (href: string) => localizePath(href, locale);

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-gray-500">No products to compare</p>
        <p className="mt-2 text-sm text-gray-400">
          Add products to compare by clicking the + button on product cards.
        </p>
        <Button asChild className="mt-6" variant="brand">
          <Link href={lh('/products')}>Browse Products</Link>
        </Button>
      </div>
    );
  }

  const specs: Array<{ key: string; label: string; getValue: (p: Product) => string }> = [
    { key: 'sku', label: 'SKU', getValue: (p) => p.sku },
    { key: 'name', label: 'Name', getValue: (p) => p.name },
    { key: 'standSize', label: 'Stand Size (mm)', getValue: (p) => p.standSize || '-' },
    { key: 'panelSize', label: 'Panel Size', getValue: (p) => p.panelSize || '-' },
    { key: 'panelThickness', label: 'Thickness', getValue: (p) => p.panelThickness || '-' },
    { key: 'packageSize', label: 'Package Size (mm)', getValue: (p) => p.packageSize || '-' },
    { key: 'numberOfPanel', label: 'Number of Panels', getValue: (p) => p.numberOfPanel ? String(p.numberOfPanel) : '-' },
    { key: 'material', label: 'Material', getValue: (p) => p.material || '-' },
    { key: 'features', label: 'Features', getValue: (p) => p.features || '-' },
  ];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40 bg-gray-50">Specification</TableHead>
            {products.map((p) => (
              <TableHead key={p.id} className="bg-gray-50">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Link href={lh(buildProductDetailPath(p.sku, p.series?.slug))} className="font-mono text-brand-400 hover:underline">
                      {p.sku}
                    </Link>
                    <button
                      onClick={() => removeProduct(p.sku)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs font-normal text-gray-500">
                    {p.series?.name}
                  </div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {specs.map((spec) => (
            <TableRow key={spec.key}>
              <TableCell className="font-medium text-gray-900">{spec.label}</TableCell>
              {products.map((p) => (
                <TableCell key={p.id} className="text-gray-700">
                  {spec.getValue(p)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-medium text-gray-900">Actions</TableCell>
            {products.map((p) => (
              <TableCell key={p.id}>
                <Button asChild size="sm" variant="brand">
                  <Link href={lh(buildProductDetailPath(p.sku, p.series?.slug))}>View Details</Link>
                </Button>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
