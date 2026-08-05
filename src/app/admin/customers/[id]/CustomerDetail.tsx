'use client';

import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function CustomerDetail({ customerId }: { customerId: number }) {
  const { data } = useSWR(`/api/admin/customers/${customerId}`, fetcher);

  if (!data) return <Skeleton className="h-96" />;
  if (data.code !== 200) return <p className="text-red-500">Customer not found</p>;

  const customer = data.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{customer.name}</h2>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{customer.tag}</Badge>
          <Badge variant="secondary">{customer.status}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {customer.phone && <div><span className="text-gray-500">Phone:</span> {customer.phone}</div>}
          {customer.company && <div><span className="text-gray-500">Company:</span> {customer.company}</div>}
          {customer.country && <div><span className="text-gray-500">Country:</span> {customer.country}</div>}
          {customer.address && <div><span className="text-gray-500">Address:</span> {customer.address}</div>}
          <div><span className="text-gray-500">Created:</span> {formatDateTime(customer.createdAt)}</div>
        </CardContent>
      </Card>

      {customer.inquiries && customer.inquiries.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Inquiry History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inquiry No</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.inquiries.map((inq: Record<string, unknown>) => (
                  <TableRow key={inq.id as number}>
                    <TableCell>
                      <Link href={`/admin/inquiries/${inq.id}`} className="font-mono text-brand-400 hover:underline">
                        {inq.inquiryNo as string}
                      </Link>
                    </TableCell>
                    <TableCell>{(inq.productSku as string) || '-'}</TableCell>
                    <TableCell><Badge variant="outline">{inq.status as string}</Badge></TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDateTime(inq.createdAt as string)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
