'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime, formatFileSize } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { Paperclip, FileText, File, Image as ImageIcon, X, Download } from 'lucide-react';
import type { Attachment, FileCategory } from '@/types/attachment';

/** Returns the appropriate lucide-react icon for a file category. */
function getCategoryIcon(category: FileCategory) {
  switch (category) {
    case 'image':
      return ImageIcon;
    case 'document':
      return FileText;
    case 'cad':
      return File;
    default:
      return File;
  }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function InquiryDetail({ inquiryId }: { inquiryId: number }) {
  const { data, mutate } = useSWR(`/api/inquiries/${inquiryId}`, fetcher);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!data) return <Skeleton className="h-96" />;
  if (data.code !== 200) return <p className="text-red-500">未找到询盘</p>;

  const inquiry = data.data;

  // Parse attachments — handle null/empty/string/array
  const allAttachments: Attachment[] = (() => {
    if (!inquiry.attachments) return [];
    if (Array.isArray(inquiry.attachments)) return inquiry.attachments as Attachment[];
    if (typeof inquiry.attachments === 'string') {
      try {
        const parsed = JSON.parse(inquiry.attachments);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();
  const imageAttachments = allAttachments.filter((a) => a.fileCategory === 'image');
  const nonImageAttachments = allAttachments.filter((a) => a.fileCategory !== 'image');

  const handleStatusChange = async (status: string) => {
    const res = await fetch(`/api/inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (result.code === 200) {
      toast.success('状态已更新');
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
            <SelectItem value="NEW">新增</SelectItem>
            <SelectItem value="CONTACTED">已联系</SelectItem>
            <SelectItem value="QUOTED">已报价</SelectItem>
            <SelectItem value="NEGOTIATING">协商中</SelectItem>
            <SelectItem value="WON">已成交</SelectItem>
            <SelectItem value="LOST">已流失</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>客户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-gray-500">姓名：</span> {inquiry.customerName}</div>
            <div><span className="text-gray-500">邮箱：</span> {inquiry.email}</div>
            {inquiry.phone && <div><span className="text-gray-500">电话：</span> {inquiry.phone}</div>}
            {inquiry.company && <div><span className="text-gray-500">公司：</span> {inquiry.company}</div>}
            {inquiry.country && <div><span className="text-gray-500">国家：</span> {inquiry.country}</div>}
            {inquiry.customerId && (
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href={`/admin/customers/${inquiry.customerId}`}>查看客户</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>询盘详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {inquiry.productSku && (
              <div><span className="text-gray-500">产品 SKU：</span> {inquiry.productSku}</div>
            )}
            {inquiry.quantity && (
              <div><span className="text-gray-500">数量：</span> {inquiry.quantity}</div>
            )}
            {inquiry.source && (
              <div><span className="text-gray-500">来源：</span> {inquiry.source}</div>
            )}
            <div className="pt-2">
              <span className="text-gray-500">留言内容：</span>
              <p className="mt-1 rounded-md bg-gray-50 p-3">{inquiry.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {allAttachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              附件 ({allAttachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {imageAttachments.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {imageAttachments.map((att: Attachment, i: number) => (
                  <div
                    key={i}
                    onClick={() => setLightboxImage(att.url)}
                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={att.url}
                      alt={att.fileName}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                      <p className="truncate text-xs text-white">{att.fileName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {nonImageAttachments.length > 0 && (
              <div className="space-y-2">
                {nonImageAttachments.map((att: Attachment, i: number) => {
                  const Icon = getCategoryIcon(att.fileCategory);
                  return (
                    <a
                      key={i}
                      href={att.url}
                      download={att.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gray-100">
                        <Icon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-700">
                          {att.fileName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(att.fileSize)} · {att.fileType.toUpperCase()}
                        </p>
                      </div>
                      <Download className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    </a>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {inquiry.followUps && inquiry.followUps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>跟进记录</CardTitle>
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

      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
            aria-label="Close preview"
          >
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Attachment preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
