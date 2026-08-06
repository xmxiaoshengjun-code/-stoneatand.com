'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
 * Renders a parent category landing page: a large title, a description,
 * and a responsive grid of child series cards. Each card shows the series
 * hero image, name, short description, and a "View Products" link.
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
      <div className="py-12 text-center text-gray-500">
        <p>Category not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category header */}
      <header className="space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">{parent.name}</h2>
        <p className="max-w-3xl text-base leading-relaxed text-gray-600">
          {parent.description}
        </p>
      </header>

      {/* Child series card grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children.map((child) => (
          <Link
            key={child.slug}
            href={lh(`/products?series=${child.slug}`)}
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              {child.heroImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={child.heroImage}
                  alt={child.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-sm text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2 p-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600">
                {child.name}
              </h3>
              <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
                {child.shortDescription}
              </p>
              <div className="flex items-center gap-1 pt-1 text-sm font-medium text-brand-600">
                View Products
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state — should never happen for valid parent slugs */}
      {children.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <p>No series found under this category.</p>
        </div>
      )}
    </div>
  );
}
