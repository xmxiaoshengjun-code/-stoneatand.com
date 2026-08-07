import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { CompareBar } from '@/components/product/CompareBar';
import { ProductCategoryIndex } from '@/components/product/ProductCategoryIndex';
import {
  isLocale,
  localizePath,
  buildCanonical,
  buildAbsoluteAlternates,
  type Locale,
} from '@/lib/i18n/config';

export function generateMetadata(): Metadata {
  return {
    title: 'Product Categories - TSIANFAN',
    description:
      'Browse all 10 product categories of premium display racks — tile, stone, wood flooring, mosaic, and more. Find the perfect display solution for your showroom.',
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

  // Backward compatibility: redirect ?series=xxx to /products/xxx
  const rawSeries =
    typeof searchParams.series === 'string' ? searchParams.series : undefined;
  if (rawSeries && rawSeries !== 'other-display') {
    redirect(lh(`/products/${rawSeries}`));
  }

  const breadcrumbItems = [
    { label: 'Home', href: lh('/') },
    { label: 'Products', href: lh('/products') },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <main className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <Breadcrumb items={breadcrumbItems} />
          <ProductCategoryIndex locale={locale} />
        </div>
      </main>
      <CompareBar />
    </>
  );
}
