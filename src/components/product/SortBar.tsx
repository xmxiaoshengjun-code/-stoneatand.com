'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizePath } from '@/lib/i18n/config';

/**
 * Sort bar for the product listing page.
 * Updates the `sort` query parameter while preserving other filters.
 */
export function SortBar({ series }: { series: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();
  const currentSort = searchParams.get('sort') || 'sortOrder';

  const lh = (href: string) => localizePath(href, locale);

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(lh(`/products/${series}?${params.toString()}`));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">{t('filters.sortBy')}</span>
      <Select value={currentSort} onValueChange={updateSort}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sortOrder">{t('filters.sortDefault')}</SelectItem>
          <SelectItem value="sku">{t('filters.sortSku')}</SelectItem>
          <SelectItem value="name">{t('filters.sortName')}</SelectItem>
          <SelectItem value="newest">{t('filters.sortNewest')}</SelectItem>
          <SelectItem value="featured">{t('filters.sortFeatured')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
