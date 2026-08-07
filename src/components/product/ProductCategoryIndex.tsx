import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { PARENT_CATEGORIES } from '@/lib/constants/series';
import { localizePath, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { imgUrl } from '@/lib/utils';

/**
 * Props for the ProductCategoryIndex component.
 */
interface ProductCategoryIndexProps {
  /** The current locale, e.g. 'en'. */
  locale: Locale;
}

/**
 * Renders the top-level product category index page (the `/products` root
 * landing page) in the style of boyadisplays.com:
 *
 * - A hero header with a localized title and description
 * - A responsive grid of parent category cards (10 categories)
 * - Each card shows a 4:3 hero image, category name, short description,
 *   and a "View {name} →" call-to-action link pointing to
 *   `/products/{slug}`
 *
 * This is an index/navigation page — it does NOT show the left sidebar
 * FilterPanel or the product list. Users click a card to drill into a
 * specific parent category landing page (ParentCategoryView).
 *
 * Data is sourced entirely from the static PARENT_CATEGORIES constant —
 * no API call is required. Translations come from getDictionary(locale).
 *
 * This is a Server Component (no 'use client') so it can be statically
 * rendered with no client-side JavaScript overhead.
 */
export async function ProductCategoryIndex({
  locale,
}: ProductCategoryIndexProps) {
  const dict = await getDictionary(locale);
  const lh = (href: string) => localizePath(href, locale);

  const categoriesTitle = dict.products.categoriesTitle;
  const categoriesDescription = dict.products.categoriesDescription;
  const viewCategoryLabel = dict.products.viewCategory;

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {categoriesTitle}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600">
          {categoriesDescription}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-400">
          <Package className="h-4 w-4" />
          {PARENT_CATEGORIES.length} categories
        </p>
      </header>

      {/* Parent category card grid — boyadisplays style */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PARENT_CATEGORIES.map((category) => {
          const ctaLabel = viewCategoryLabel.replace('{name}', category.name);
          const categoryHref = lh(`/products/${category.slug}`);

          return (
            <Link
              key={category.slug}
              href={categoryHref}
              className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
            >
              {/* 4:3 hero image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {category.heroImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imgUrl(category.heroImage)}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Package className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Card content */}
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                  {category.name}
                </h2>
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
