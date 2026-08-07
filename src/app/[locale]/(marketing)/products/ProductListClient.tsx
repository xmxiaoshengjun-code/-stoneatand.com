'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { FilterPanel } from '@/components/product/FilterPanel';
import { SortBar } from '@/components/product/SortBar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { type Locale } from '@/lib/i18n/config';

/**
 * Client component for the product listing page.
 *
 * Renders the left sidebar FilterPanel and the product grid with sorting
 * and pagination. Parent category slugs are handled by page.tsx (server-side)
 * which renders ParentCategoryView directly, so this component only receives
 * child series slugs or no series at all.
 */
export function ProductListClient({ locale, series }: { locale: Locale; series: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { t } = useI18n();

  const params = {
    series: series,
    panelSize: searchParams.get('panelSize') || undefined,
    panelThickness: searchParams.get('panelThickness') || undefined,
    keyword: searchParams.get('keyword') || undefined,
    page: parseInt(searchParams.get('page') || '1', 10) || 1,
    pageSize: 12,
    sort: searchParams.get('sort') || 'sortOrder',
  };

  const { products, total, totalPages, isLoading } = useProducts(params);

  // Clamp current page to valid range [1, totalPages] to prevent
  // out-of-bounds page values from showing Prev/Next incorrectly.
  const currentPage =
    totalPages > 0
      ? Math.min(Math.max(params.page, 1), totalPages)
      : Math.max(params.page, 1);

  /**
   * Builds a URL for the given page number, preserving all existing
   * search params (series, panelSize, etc.) and only updating `page`.
   * Page 1 omits the `page` param for a clean URL.
   */
  const buildPageUrl = (page: number): string => {
    const urlParams = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      urlParams.delete('page');
    } else {
      urlParams.set('page', String(page));
    }
    const qs = urlParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar filters */}
      <aside className="lg:w-64 lg:shrink-0">
        <FilterPanel series={series} />
      </aside>

      {/* Product grid */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {isLoading
              ? t('products.loading')
              : `${total} ${t('products.productsFound')}`}
          </p>
          <SortBar series={series} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 ? (
                  <PaginationItem>
                    <PaginationPrevious href={buildPageUrl(currentPage - 1)} />
                  </PaginationItem>
                ) : null}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          href={buildPageUrl(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                {currentPage < totalPages ? (
                  <PaginationItem>
                    <PaginationNext href={buildPageUrl(currentPage + 1)} />
                  </PaginationItem>
                ) : null}
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </div>
    </div>
  );
}
