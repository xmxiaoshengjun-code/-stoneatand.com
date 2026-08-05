'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SERIES_INFO } from '@/lib/constants/series';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

      {/* Series filter */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Series</label>
        <Select value={currentSeries} onValueChange={(v) => updateFilter('series', v === 'all' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="All series" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All series</SelectItem>
            {SERIES_INFO.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.name} ({s.prefix})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
