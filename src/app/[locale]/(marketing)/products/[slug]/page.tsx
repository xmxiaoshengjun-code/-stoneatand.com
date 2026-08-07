import { redirect, notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { CompareBar } from '@/components/product/CompareBar';
import { ProductListClient } from '../ProductListClient';
import { ParentCategoryView } from '@/components/product/ParentCategoryView';
import {
  isLocale,
  localizePath,
  buildCanonical,
  buildAbsoluteAlternates,
  type Locale,
  LOCALES,
} from '@/lib/i18n/config';
import {
  isParentSlug,
  getParentCategory,
  getChildSeries,
  SERIES_BY_SLUG,
  PARENT_CATEGORIES,
  SERIES_INFO,
  buildProductDetailPath,
} from '@/lib/constants/series';
import { productService } from '@/lib/services/productService';

interface PageProps {
  params: { slug: string; locale: string };
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const parent of PARENT_CATEGORIES) {
    for (const locale of LOCALES) {
      params.push({ locale, slug: parent.slug });
    }
  }
  for (const series of SERIES_INFO) {
    for (const locale of LOCALES) {
      params.push({ locale, slug: series.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const slug = params.slug;

  if (isParentSlug(slug)) {
    const parent = getParentCategory(slug);
    if (parent) {
      return {
        title: `${parent.name} - TSIANFAN`,
        description: parent.description,
        alternates: {
          canonical: buildCanonical(`/products/${slug}`),
          ...buildAbsoluteAlternates(`/products/${slug}`),
        },
      };
    }
  }

  const series = SERIES_BY_SLUG[slug];
  if (series) {
    return {
      title: `${series.name} - TSIANFAN`,
      description: series.description,
      alternates: {
        canonical: buildCanonical(`/products/${slug}`),
        ...buildAbsoluteAlternates(`/products/${slug}`),
      },
    };
  }

  return { title: 'Product Not Found' };
}

export default async function SeriesPage({ params }: PageProps) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);
  const slug = params.slug;

  // ── Parent category view ──────────────────────────────────────────
  if (isParentSlug(slug)) {
    const children = getChildSeries(slug);
    if (children.length === 1) {
      redirect(lh(`/products/${children[0].slug}`));
    }

    const parent = getParentCategory(slug);
    if (!parent) notFound();

    const breadcrumbItems = [
      { label: 'Home', href: lh('/') },
      { label: 'Products', href: lh('/products') },
      { label: parent.name },
    ];

    return (
      <>
        <BreadcrumbJsonLd items={breadcrumbItems} />
        <main className="min-h-screen bg-gray-50">
          <div className="container-custom py-8">
            <Breadcrumb items={breadcrumbItems} />
            <ParentCategoryView parentSlug={slug} locale={locale} />
          </div>
        </main>
        <CompareBar />
      </>
    );
  }

  // ── Child series product list ─────────────────────────────────────
  const series = SERIES_BY_SLUG[slug];
  if (series) {
    const breadcrumbItems: Array<{ label: string; href?: string }> = [
      { label: 'Home', href: lh('/') },
      { label: 'Products', href: lh('/products') },
    ];

    if (series.parentSlug) {
      const parent = getParentCategory(series.parentSlug);
      if (parent) {
        breadcrumbItems.push({
          label: parent.name,
          href: lh(`/products/${series.parentSlug}`),
        });
      }
    }
    breadcrumbItems.push({ label: series.name });

    return (
      <>
        <BreadcrumbJsonLd items={breadcrumbItems} />
        <main className="min-h-screen bg-gray-50">
          <div className="container-custom py-8">
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{series.name}</h1>
            <p className="mb-8 text-gray-600">{series.description}</p>
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
              <ProductListClient locale={locale} series={slug} />
            </Suspense>
          </div>
        </main>
        <CompareBar />
      </>
    );
  }

  // ── Legacy SKU redirect ───────────────────────────────────────────
  const product = await productService.getProductBySku(slug);
  if (product) {
    const newPath = buildProductDetailPath(product.sku, product.series?.slug);
    redirect(lh(newPath));
  }

  notFound();
}
