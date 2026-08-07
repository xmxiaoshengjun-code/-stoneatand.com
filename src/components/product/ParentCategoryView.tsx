'use client';

import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { getParentCategory, getChildSeries } from '@/lib/constants/series';
import { localizePath, type Locale } from '@/lib/i18n/config';

/**
 * Props for the ParentCategoryView component.
 */
interface ParentCategoryViewProps {
  /** The parent category slug, e.g. 'tile-displays-rack'. */
  parentSlug: string;
  /** The current locale, e.g. 'en'. */
  locale: Locale;
}

/**
 * Renders a parent category landing page (index page) in the style of
 * insca.com and boyadisplays.com:
 *
 * - A large hero header with the category name and description
 * - A responsive grid of child series cards
 * - Each card shows a 4:3 hero image, series name, short description,
 *   and a "View Products →" call-to-action link
 *
 * This is an index/landing page — it does NOT show the left sidebar
 * FilterPanel or the product list. Users click a card to drill into
 * a specific child series product listing.
 *
 * Data is sourced entirely from the static SERIES_INFO / PARENT_CATEGORIES
 * constants — no API call is required.
 */
export function ParentCategoryView({ parentSlug, locale }: ParentCategoryViewProps) {
  const lh = (href: string) => localizePath(href, locale);

  const parent = getParentCategory(parentSlug);
  const children = getChildSeries(parentSlug);

  // If the parent slug doesn't match any known category, show a fallback.
  if (!parent) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-gray-500">Category not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {parent.name}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600">
          {parent.description}
        </p>
        {children.length > 0 ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-400">
            <Package className="h-4 w-4" />
            {children.length} series available
          </p>
        ) : null}
      </header>

      {/* Child series card grid — insca/boyadisplays style */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children.map((child) => (
          <Link
            key={child.slug}
            href={lh(`/products/${child.slug}`)}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
          >
            {/* 4:3 hero image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              {child.heroImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={child.heroImage}
                  alt={child.name}
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
              <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-brand-600">
                {child.name}
              </h3>
              <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
                {child.shortDescription}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                View Products
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state — should never happen for valid parent slugs */}
      {children.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-500">
            No series found under this category.
          </p>
        </div>
      ) : null}
    </div>
  );
}
