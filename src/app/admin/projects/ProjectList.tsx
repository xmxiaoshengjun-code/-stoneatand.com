'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ProjectList() {
  const { data, isLoading } = useSWR('/api/admin/projects?pageSize=100', fetcher);

  if (isLoading) return <Skeleton className="h-96" />;

  const projects = data?.data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild variant="brand">
          <Link href="/admin/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            新建项目
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>位置</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p: Record<string, unknown>) => (
              <TableRow key={p.id as number}>
                <TableCell className="font-medium">{p.title as string}</TableCell>
                <TableCell>{(p.location as string) || '-'}</TableCell>
                <TableCell>
                  <Badge variant={p.isPublished ? 'success' : 'secondary'}>
                    {p.isPublished ? '已发布' : '隐藏'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/projects/${p.id}/edit`}>
                      <Pencil className="h-3 w-3" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )) || (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">暂无项目</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
