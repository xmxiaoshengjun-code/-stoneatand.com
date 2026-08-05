'use client';

import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface TrackingStats {
  todayUV: number;
  todayPV: number;
  avgDuration: number;
  topPages: Array<{ url: string; pv: number }>;
  topCountries: Array<{ country: string; count: number }>;
  trend: Array<{ date: string; uv: number; pv: number }>;
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', CA: '🇨🇦',
  CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', IN: '🇮🇳', AU: '🇦🇺',
  NL: '🇳🇱', IT: '🇮🇹', ES: '🇪🇸', BR: '🇧🇷', MX: '🇲🇽',
};

function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country.toUpperCase()] || '🌍';
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DashboardClient() {
  const { data: statsData, isLoading: statsLoading } = useSWR('/api/admin/stats', fetcher);
  const { data: trackingData, isLoading: trackingLoading } = useSWR('/api/admin/tracking/stats', fetcher);

  if (statsLoading || trackingLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const inquiries = statsData?.data?.inquiries;
  const tracking: TrackingStats | undefined = trackingData?.data;

  // Inquiry stat cards
  const inquiryCards = [
    { label: 'Total Inquiries', value: inquiries?.total || 0, color: 'bg-blue-500' },
    { label: 'New', value: inquiries?.newCount || 0, color: 'bg-yellow-500' },
    { label: 'Contacted', value: inquiries?.contactedCount || 0, color: 'bg-purple-500' },
    { label: 'Won', value: inquiries?.wonCount || 0, color: 'bg-green-500' },
  ];

  // Tracking stat cards
  const trackingCards = [
    { label: "Today's Visitors (UV)", value: tracking?.todayUV ?? 0, color: 'bg-cyan-500' },
    { label: "Today's Page Views (PV)", value: tracking?.todayPV ?? 0, color: 'bg-indigo-500' },
    { label: 'Avg. Page Duration', value: formatDuration(tracking?.avgDuration ?? 0), color: 'bg-teal-500' },
  ];

  // Trend chart dimensions
  const trend = tracking?.trend ?? [];
  const maxPV = Math.max(...trend.map((t) => t.pv), 1);
  const maxUV = Math.max(...trend.map((t) => t.uv), 1);
  const maxValue = Math.max(maxPV, maxUV);

  return (
    <div className="space-y-8">
      {/* Tracking Stats Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Visitor Analytics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {trackingCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-full ${stat.color} opacity-20`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      {trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>7-Day Traffic Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2" style={{ height: '200px' }}>
              {trend.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end justify-center gap-1">
                    {/* PV bar */}
                    <div
                      className="w-1/2 rounded-t bg-indigo-400 transition-all"
                      style={{ height: `${(day.pv / maxValue) * 100}%`, minHeight: '2px' }}
                      title={`PV: ${day.pv}`}
                    />
                    {/* UV bar */}
                    <div
                      className="w-1/2 rounded-t bg-cyan-400 transition-all"
                      style={{ height: `${(day.uv / maxValue) * 100}%`, minHeight: '2px' }}
                      title={`UV: ${day.uv}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{formatDateShort(day.date)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-indigo-400" />
                <span className="text-gray-600">Page Views (PV)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-cyan-400" />
                <span className="text-gray-600">Unique Visitors (UV)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Pages & Top Countries */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {(tracking?.topPages?.length ?? 0) > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tracking!.topPages.map((page, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-sm">{page.url}</TableCell>
                      <TableCell className="text-right font-semibold">{page.pv}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-4 text-center text-sm text-gray-400">No page view data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {(tracking?.topCountries?.length ?? 0) > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tracking!.topCountries.map((c, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <span className="mr-2">{getCountryFlag(c.country)}</span>
                        {c.country}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{c.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-4 text-center text-sm text-gray-400">No country data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inquiry Stats Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Inquiry Statistics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {inquiryCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-full ${stat.color} opacity-20`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent inquiries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inquiry No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries?.recentInquiries?.map((inq: Record<string, unknown>) => (
                <TableRow key={inq.id as number}>
                  <TableCell>
                    <Link href={`/admin/inquiries/${inq.id}`} className="font-mono text-brand-400 hover:underline">
                      {inq.inquiryNo as string}
                    </Link>
                  </TableCell>
                  <TableCell>{inq.customerName as string}</TableCell>
                  <TableCell>{(inq.productSku as string) || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{inq.status as string}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDateTime(inq.createdAt as string)}
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No recent inquiries
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
