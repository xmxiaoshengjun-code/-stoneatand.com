'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function CustomerList() {
  const [keyword, setKeyword] = useState('');
  const { data, isLoading } = useSWR(
    `/api/admin/customers?keyword=${keyword}&pageSize=50`,
    fetcher
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search customers..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="max-w-xs"
      />

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.items?.map((c: Record<string, unknown>) => (
                <TableRow key={c.id as number}>
                  <TableCell>
                    <Link href={`/admin/customers/${c.id}`} className="font-medium text-brand-400 hover:underline">
                      {c.name as string}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{c.email as string}</TableCell>
                  <TableCell>{(c.company as string) || '-'}</TableCell>
                  <TableCell>{(c.country as string) || '-'}</TableCell>
                  <TableCell><Badge variant="outline">{c.tag as string}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{c.status as string}</Badge></TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDate(c.createdAt as string)}</TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">No customers found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
