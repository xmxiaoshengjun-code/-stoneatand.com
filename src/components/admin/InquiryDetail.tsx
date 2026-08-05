'use client';

import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function InquiryDetail({ inquiryId }: { inquiryId: number }) {
  const { data, mutate } = useSWR(`/api/inquiries/${inquiryId}`, fetcher);

  if (!data) return <Skeleton className="h-96" />;
  if (data.code !== 200) return <p className="text-red-500">Inquiry not found</p>;

  const inquiry = data.data;

  const handleStatusChange = async (status: string) => {
    const res = await fetch(`/api/inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (result.code === 200) {
      toast.success('Status updated');
      mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{inquiry.inquiryNo}</h2>
          <p className="text-sm text-gray-500">{formatDateTime(inquiry.createdAt)}</p>
        </div>
        <Select defaultValue={inquiry.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="QUOTED">Quoted</SelectItem>
            <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
            <SelectItem value="WON">Won</SelectItem>
            <SelectItem value="LOST">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-gray-500">Name:</span> {inquiry.customerName}</div>
            <div><span className="text-gray-500">Email:</span> {inquiry.email}</div>
            {inquiry.phone && <div><span className="text-gray-500">Phone:</span> {inquiry.phone}</div>}
            {inquiry.company && <div><span className="text-gray-500">Company:</span> {inquiry.company}</div>}
            {inquiry.country && <div><span className="text-gray-500">Country:</span> {inquiry.country}</div>}
            {inquiry.customerId && (
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href={`/admin/customers/${inquiry.customerId}`}>View Customer</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inquiry Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {inquiry.productSku && (
              <div><span className="text-gray-500">Product SKU:</span> {inquiry.productSku}</div>
            )}
            {inquiry.quantity && (
              <div><span className="text-gray-500">Quantity:</span> {inquiry.quantity}</div>
            )}
            {inquiry.source && (
              <div><span className="text-gray-500">Source:</span> {inquiry.source}</div>
            )}
            <div className="pt-2">
              <span className="text-gray-500">Message:</span>
              <p className="mt-1 rounded-md bg-gray-50 p-3">{inquiry.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {inquiry.followUps && inquiry.followUps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inquiry.followUps.map((fu: Record<string, unknown>) => (
              <div key={fu.id as number} className="border-l-2 border-brand-400 pl-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{fu.type as string}</Badge>
                  <span className="text-xs text-gray-500">{formatDateTime(fu.createdAt as string)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-700">{fu.content as string}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
