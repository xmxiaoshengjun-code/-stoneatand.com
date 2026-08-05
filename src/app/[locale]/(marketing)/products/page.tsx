import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { CompareBar } from '@/components/product/CompareBar';
import { ProductListClient } from './ProductListClient';
import { isLocale, localizePath, buildAlternates, type Locale } from '@/lib/i18n/config';

export function generateMetadata(): Metadata {
  return {
    title: 'Products - Tile Display Racks',
    description: 'Browse our complete catalog of 55 tile display rack SKUs across 7 product series.',
    alternates: buildAlternates('/products'),
  };
}

export default function ProductsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <Breadcrumb
            items={[
              { label: 'Home', href: lh('/') },
              { label: 'Products' },
            ]}
          />
          <h1 className="mb-2 text-3xl font-bold text-gray-900">All Products</h1>
          <p className="mb-8 text-gray-600">
            Browse our complete catalog of premium tile display racks.
          </p>
          <ProductListClient />
        </div>
      </main>
      <CompareBar />
    </>
  );
}
