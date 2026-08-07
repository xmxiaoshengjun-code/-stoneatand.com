'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ProductTable() {
  const { data, isLoading } = useSWR('/api/admin/products?pageSize=100', fetcher);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const products = data?.data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild variant="brand">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            新建产品
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>系列</TableHead>
              <TableHead>面板尺寸</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p: Record<string, unknown>) => (
              <TableRow key={p.id as number}>
                <TableCell className="font-mono font-semibold">{p.sku as string}</TableCell>
                <TableCell className="max-w-xs truncate">{p.name as string}</TableCell>
                <TableCell>{(p.series as Record<string, string>)?.name || '-'}</TableCell>
                <TableCell>{(p.panelSize as string) || '-'}</TableCell>
                <TableCell>
                  {p.isPublished ? (
                    <Badge variant="success">
                      <Eye className="mr-1 h-3 w-3" />
                      已发布
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <EyeOff className="mr-1 h-3 w-3" />
                      隐藏
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Pencil className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
