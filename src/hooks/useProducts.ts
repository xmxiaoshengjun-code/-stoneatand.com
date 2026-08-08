'use client';

import useSWR from 'swr';
import type { ProductFilterParams, ProductListResponse } from '@/types/product';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Hook for fetching products with filters via SWR.
 */
export function useProducts(
  params: ProductFilterParams,
  fallbackData?: { code: number; data: ProductListResponse }
) {
  const searchParams = new URLSearchParams();
  if (params.series) searchParams.set('series', params.series);
  if (params.panelSize) searchParams.set('panelSize', params.panelSize);
  if (params.panelThickness) searchParams.set('panelThickness', params.panelThickness);
  if (params.keyword) searchParams.set('keyword', params.keyword);
  if (params.isFeatured !== undefined) searchParams.set('isFeatured', String(params.isFeatured));
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.sort) searchParams.set('sort', params.sort);

  const { data, error, isLoading, mutate } = useSWR<{ code: number; data: ProductListResponse }>(
    `/api/products?${searchParams.toString()}`,
    fetcher,
    fallbackData ? { fallbackData } : undefined
  );

  return {
    products: data?.data?.items || [],
    total: data?.data?.total || 0,
    totalPages: data?.data?.totalPages || 0,
    isLoading,
    isError: error,
    mutate,
  };
}
