import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { CompareBar } from '@/components/product/CompareBar';
import { ProductListClient } from './ProductListClient';
import { isLocale, localizePath, buildAbsoluteAlternates, buildCanonical, type Locale } from '@/lib/i18n/config';
import { isParentSlug, getParentCategory, SERIES_BY_SLUG } from '@/lib/constants/series';

export function generateMetadata(): Metadata {
  return {
    title: 'Products - Tile Display Racks',
    description: 'Browse our complete catalog of 172+ premium display racks across 17 product series. Wall sliding racks, drawer cabinets, floor-standing displays and more.',
    alternates: {
      canonical: buildCanonical('/products'),
      ...buildAbsoluteAlternates('/products'),
    },
  };
}

export default function ProductsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);

  // Determine the series from search params (may be a parent slug, a child
  // series slug, or absent). This drives the dynamic page title and breadcrumb.
  // 'other-display' is a legacy slug with no new parent equivalent — treat as
  // no series so the page shows "All Products" without infinite redirects.
  const rawSeries = typeof searchParams.series === 'string' ? searchParams.series : undefined;
  const seriesParam = rawSeries === 'other-display' ? undefined : rawSeries;

  let pageTitle = 'All Products';
  let pageDescription = 'Browse our complete catalog of premium tile display racks.';
  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: 'Home', href: lh('/') },
    { label: 'Products', href: lh('/products') },
  ];

  if (seriesParam) {
    if (isParentSlug(seriesParam)) {
      const parent = getParentCategory(seriesParam);
      if (parent) {
        pageTitle = parent.name;
        pageDescription = parent.description;
        breadcrumbItems.push({ label: parent.name });
      }
    } else {
      const series = SERIES_BY_SLUG[seriesParam];
      if (series) {
        pageTitle = series.name;
        pageDescription = series.description;
        breadcrumbItems.push({ label: series.name });
      }
    }
  }

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <main className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="mb-8 text-gray-600">
            {pageDescription}
          </p>
          <Suspense
            fallback={
              <div className="flex flex-col gap-6 lg:flex-row">
                <aside className="lg:w-64 lg:shrink-0">
                  <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
                </aside>
                <div className="flex-1">
                  <div className="mb-4 h-8 w-48 animate-pulse rounded bg-gray-200" />
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <div className="h-48 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }
          >
            <ProductListClient locale={locale} />
          </Suspense>
        </div>
      </main>
      <CompareBar />
    </>
  );
}
