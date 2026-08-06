'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { FilterPanel } from '@/components/product/FilterPanel';
import { SortBar } from '@/components/product/SortBar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { isParentSlug } from '@/lib/constants/series';
import { ParentCategoryView } from '@/components/product/ParentCategoryView';
import { type Locale } from '@/lib/i18n/config';

export function ProductListClient({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const params = {
    // 'other-display' is a legacy slug with no new parent category equivalent.
    // Treat it as no series filter so the full product list is shown.
    series: (searchParams.get('series') && searchParams.get('series') !== 'other-display')
      ? searchParams.get('series') || undefined
      : undefined,
    panelSize: searchParams.get('panelSize') || undefined,
    panelThickness: searchParams.get('panelThickness') || undefined,
    keyword: searchParams.get('keyword') || undefined,
    page: parseInt(searchParams.get('page') || '1', 10) || 1,
    pageSize: 12,
    sort: searchParams.get('sort') || 'sortOrder',
  };

  const { products, total, totalPages, isLoading } = useProducts(params);

  // If the series param matches a parent category slug (e.g. 'tile-displays-rack'),
  // render the parent category landing view instead of the normal product list.
  if (params.series && isParentSlug(params.series)) {
    return <ParentCategoryView parentSlug={params.series} locale={locale} />;
  }

  // Clamp current page to valid range [1, totalPages] to prevent
  // out-of-bounds page values from showing Prev/Next incorrectly.
  const currentPage =
    totalPages > 0 ? Math.min(Math.max(params.page, 1), totalPages) : Math.max(params.page, 1);

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
        <FilterPanel />
      </aside>

      {/* Product grid */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {isLoading ? 'Loading...' : `${total} products found`}
          </p>
          <SortBar />
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
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href={buildPageUrl(currentPage - 1)} />
                  </PaginationItem>
                )}
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
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext href={buildPageUrl(currentPage + 1)} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
