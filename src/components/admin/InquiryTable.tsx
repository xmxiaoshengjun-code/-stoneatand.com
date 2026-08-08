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
import { Paperclip } from 'lucide-react';

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
          placeholder="搜索询盘..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="全部状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="NEW">新增</SelectItem>
            <SelectItem value="CONTACTED">已联系</SelectItem>
            <SelectItem value="QUOTED">已报价</SelectItem>
            <SelectItem value="NEGOTIATING">协商中</SelectItem>
            <SelectItem value="WON">已成交</SelectItem>
            <SelectItem value="LOST">已流失</SelectItem>
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
                <TableHead>询盘编号</TableHead>
                <TableHead>客户</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>产品</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>日期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.items?.map((inq: Record<string, unknown>) => (
                <TableRow key={inq.id as number}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/inquiries/${inq.id}`} className="font-mono text-brand-400 hover:underline">
                        {inq.inquiryNo as string}
                      </Link>
                      {(() => {
                        const atts = inq.attachments;
                        if (!atts) return null;
                        let arr: unknown[] = [];
                        if (Array.isArray(atts)) {
                          arr = atts as unknown[];
                        } else if (typeof atts === 'string') {
                          try {
                            const parsed = JSON.parse(atts);
                            if (Array.isArray(parsed)) arr = parsed;
                          } catch {
                            // ignore
                          }
                        }
                        if (arr.length === 0) return null;
                        return (
                          <Paperclip className="h-3.5 w-3.5 text-gray-400" />
                        );
                      })()}
                    </div>
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
                    暂无询盘数据
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
