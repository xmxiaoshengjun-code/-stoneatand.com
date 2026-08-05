'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline' | 'brand'> = {
  NEW: 'warning',
  CONTACTED: 'secondary',
  QUOTED: 'brand',
  NEGOTIATING: 'secondary',
  WON: 'success',
  LOST: 'destructive',
};

export function InquiryTable() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const queryParams = new URLSearchParams();
  if (keyword) queryParams.set('keyword', keyword);
  if (status) queryParams.set('status', status);
  queryParams.set('pageSize', '50');

  const { data, isLoading } = useSWR(`/api/inquiries?${queryParams.toString()}`, fetcher);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search inquiries..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="QUOTED">Quoted</SelectItem>
            <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
            <SelectItem value="WON">Won</SelectItem>
            <SelectItem value="LOST">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inquiry No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.items?.map((inq: Record<string, unknown>) => (
                <TableRow key={inq.id as number}>
                  <TableCell>
                    <Link href={`/admin/inquiries/${inq.id}`} className="font-mono text-brand-400 hover:underline">
                      {inq.inquiryNo as string}
                    </Link>
                  </TableCell>
                  <TableCell>{inq.customerName as string}</TableCell>
                  <TableCell className="text-sm text-gray-500">{inq.email as string}</TableCell>
                  <TableCell>{(inq.productSku as string) || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[inq.status as string] || 'outline'}>
                      {inq.status as string}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDateTime(inq.createdAt as string)}
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No inquiries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
