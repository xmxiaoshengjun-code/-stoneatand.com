'use client';

import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { FilterPanel } from '@/components/product/FilterPanel';
import { SortBar } from '@/components/product/SortBar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductListClient() {
  const searchParams = useSearchParams();

  const params = {
    series: searchParams.get('series') || undefined,
    panelSize: searchParams.get('panelSize') || undefined,
    panelThickness: searchParams.get('panelThickness') || undefined,
    keyword: searchParams.get('keyword') || undefined,
    page: Number(searchParams.get('page')) || 1,
    pageSize: 12,
    sort: searchParams.get('sort') || 'sortOrder',
  };

  const { products, total, totalPages, isLoading } = useProducts(params);

  const updatePage = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page));
    window.location.href = url.toString();
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
                {params.page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious onClick={() => updatePage(params.page - 1)} />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= params.page - 1 && page <= params.page + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === params.page}
                          onClick={() => updatePage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                {params.page < totalPages && (
                  <PaginationItem>
                    <PaginationNext onClick={() => updatePage(params.page + 1)} />
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
