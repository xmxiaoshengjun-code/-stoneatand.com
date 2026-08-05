'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { SERIES_INFO } from '@/lib/constants/series';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  prefix: string;
  parentId: number | null;
  children: CategoryNode[];
}

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch category tree for hierarchical display
  const { data: catData } = useSWR('/api/admin/categories', fetcher, {
    onError: () => {},
  });
  const categoryTree: CategoryNode[] = catData?.data?.tree ?? [];

  const currentSeries = searchParams.get('series') || '';
  const currentThickness = searchParams.get('panelThickness') || '';
  const currentKeyword = searchParams.get('keyword') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/products');
  };

  const hasFilters = currentSeries || currentThickness || currentKeyword;

  // Build flat list of all series slugs from SERIES_INFO for fallback
  const allSeriesSlugs = SERIES_INFO.map((s) => s.slug);

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-400"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Series filter with hierarchical display */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
        <Select value={currentSeries} onValueChange={(v) => updateFilter('series', v === 'all' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryTree.length > 0 ? (
              categoryTree.map((node) => (
                <SelectItem key={node.id} value={node.slug}>
                  {node.name} ({node.prefix})
                </SelectItem>
              ))
            ) : (
              allSeriesSlugs.map((slug) => {
                const info = SERIES_INFO.find((s) => s.slug === slug);
                return (
                  <SelectItem key={slug} value={slug}>
                    {info?.name || slug} ({info?.prefix || ''})
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
        {/* Display child categories as indented options if tree has children */}
        {categoryTree.length > 0 && categoryTree.some((n) => n.children.length > 0) && (
          <div className="mt-2 space-y-1">
            {categoryTree
              .filter((n) => n.children.length > 0)
              .map((parent) => (
                <div key={parent.id}>
                  <p className="text-xs font-medium text-gray-500">{parent.name}</p>
                  <div className="ml-3 space-y-0.5">
                    {parent.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => updateFilter('series', child.slug)}
                        className={`block w-full text-left text-xs hover:text-brand-400 ${
                          currentSeries === child.slug ? 'font-medium text-brand-400' : 'text-gray-600'
                        }`}
                      >
                        └ {child.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Thickness filter */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Panel Thickness</label>
        <Select value={currentThickness} onValueChange={(v) => updateFilter('panelThickness', v === 'all' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="All thicknesses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All thicknesses</SelectItem>
            <SelectItem value="7">7-9.5mm (Ultra-thin)</SelectItem>
            <SelectItem value="10">10mm (Thin)</SelectItem>
            <SelectItem value="12">12mm (Standard)</SelectItem>
            <SelectItem value="15">15mm (Thick)</SelectItem>
            <SelectItem value="20">20mm (Slab)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="SKU, name, keyword..."
            defaultValue={currentKeyword}
            className="pl-9"
            onChange={(e) => updateFilter('keyword', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
