import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { productService } from '@/lib/services/productService';
import { CompareTable } from './CompareTable';
import { isLocale, localizePath, buildAlternates, type Locale } from '@/lib/i18n/config';

export function generateMetadata(): Metadata {
  return {
    title: 'Compare Products',
    description: 'Compare tile display rack specifications side by side.',
    alternates: buildAlternates('/compare'),
  };
}

export default async function ComparePage({
  searchParams,
  params,
}: {
  searchParams: { skus?: string };
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);
  const skus = searchParams.skus ? searchParams.skus.split(',').filter(Boolean) : [];
  const products = await productService.getProductsBySkus(skus);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: lh('/') },
            { label: 'Products', href: lh('/products') },
            { label: 'Compare' },
          ]}
        />
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Compare Products</h1>
        <p className="mb-8 text-gray-600">
          Compare specifications side by side to find the best fit for your needs.
        </p>
        <CompareTable products={products} />
      </div>
    </main>
  );
}
