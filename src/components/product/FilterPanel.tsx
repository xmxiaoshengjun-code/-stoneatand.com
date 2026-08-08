'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Search, X, LayoutGrid } from 'lucide-react';
import {
  PARENT_CATEGORIES,
  SERIES_INFO,
  getChildSeries,
  isParentSlug,
} from '@/lib/constants/series';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizePath } from '@/lib/i18n/config';

/**
 * Left sidebar filter panel for the products listing page.
 *
 * Features:
 * - Accordion-style category navigation (parent categories expand to show child series)
 * - Larger fonts for readability (text-base for parents, text-sm for children)
 * - Active state highlighting with brand color
 * - Locale-aware URL navigation
 * - Mobile-friendly responsive design
 */
export function FilterPanel({ series }: { series: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();

  const currentSeries = series;
  const currentThickness = searchParams.get('panelThickness') || '';
  const currentKeyword = searchParams.get('keyword') || '';

  /**
   * Local state for the search input, synced with the URL param.
   * Debounced so router.push only fires after the user stops typing.
   */
  const [searchInput, setSearchInput] = useState(currentKeyword);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local search input when the URL keyword param changes externally
  // (e.g., clearing filters or navigating from another page).
  useEffect(() => {
    setSearchInput(currentKeyword);
  }, [currentKeyword]);

  // Cleanup debounce timer on unmount.
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const lh = useCallback((href: string) => localizePath(href, locale), [locale]);

  /**
   * Determines which parent category should be expanded by default.
   * If the current series is a parent slug, expand it.
   * If the current series is a child series, expand its parent.
   */
  const initialExpanded = useMemo((): Set<string> => {
    const expanded = new Set<string>();
    if (!currentSeries) return expanded;
    if (isParentSlug(currentSeries)) {
      expanded.add(currentSeries);
    } else {
      const seriesInfo = SERIES_INFO.find((s) => s.slug === currentSeries);
      if (seriesInfo?.parentSlug) {
        expanded.add(seriesInfo.parentSlug);
      }
    }
    return expanded;
  }, [currentSeries]);

  const [expandedParents, setExpandedParents] = useState<Set<string>>(initialExpanded);

  /**
   * Navigates to a series page, preserving filter query params.
   */
  const navigateToSeries = useCallback((slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    const qs = params.toString();
    if (qs) {
      router.push(lh(`/products/${slug}?${qs}`));
    } else {
      router.push(lh(`/products/${slug}`));
    }
  }, [router, searchParams, lh]);

  /**
   * Updates a filter parameter (panelThickness, keyword) in the URL,
   * preserving the current series path. Resets pagination to page 1.
   */
  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    const qs = params.toString();
    if (qs) {
      router.push(lh(`/products/${currentSeries}?${qs}`));
    } else {
      router.push(lh(`/products/${currentSeries}`));
    }
  }, [router, searchParams, lh, currentSeries]);

  /**
   * Handles search input changes with a 400ms debounce.
   * Updates local state immediately for responsive UX, but only
   * pushes the URL change (which triggers API re-fetch) after the
   * user stops typing.
   */
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateFilter('keyword', value);
    }, 400);
  }, [updateFilter]);

  /** Clears all filters and returns to the base products page. */
  const clearFilters = () => {
    router.push(lh('/products'));
  };

  const hasFilters = currentSeries || currentThickness || currentKeyword;

  /**
   * Toggles the expansion state of a parent category in the accordion.
   */
  const toggleParent = (slug: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  return (
    <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="text-base font-bold text-gray-900">{t('filters.title')}</h3>
        {hasFilters ? (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-brand-400"
          >
            <X className="h-4 w-4" />
            {t('filters.clearAll')}
          </button>
        ) : null}
      </div>

      {/* Category accordion */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {t('filters.category')}
        </h4>

        {/* "All Categories" link — clears the series filter */}
        <button
          onClick={clearFilters}
          className={`mb-2 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
            !currentSeries
              ? 'bg-brand-50 text-brand-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <LayoutGrid className="h-4 w-4 shrink-0" />
          {t('filters.allCategories')}
        </button>

        {/* Parent categories with accordion expand/collapse */}
        <div className="space-y-0.5">
          {PARENT_CATEGORIES.map((parent) => {
            const children = getChildSeries(parent.slug);
            const isExpanded = expandedParents.has(parent.slug);
            const isActive = currentSeries === parent.slug;
            const hasActiveChild = children.some((c) => c.slug === currentSeries);

            return (
              <div key={parent.slug}>
                {/* Parent category row: click name to navigate, click chevron to expand */}
                <div className="flex items-stretch rounded-md hover:bg-gray-50">
                  <button
                    onClick={() => navigateToSeries(parent.slug)}
                    className={`flex flex-1 items-center px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-brand-600'
                        : hasActiveChild
                          ? 'text-gray-900'
                          : 'text-gray-700 hover:text-brand-400'
                    }`}
                  >
                    {parent.name}
                  </button>
                  {children.length > 0 ? (
                    <button
                      onClick={() => toggleParent(parent.slug)}
                      className="flex items-center px-3 text-gray-400 transition-colors hover:text-brand-400"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  ) : null}
                </div>

                {/* Child series (accordion content) */}
                {isExpanded && children.length > 0 ? (
                  <div className="ml-4 border-l-2 border-gray-100 pl-2">
                    {children.map((child) => (
                      <button
                        key={child.slug}
                        onClick={() => navigateToSeries(child.slug)}
                        className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          currentSeries === child.slug
                            ? 'bg-brand-50 font-medium text-brand-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-brand-400'
                        }`}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel thickness filter */}
      <div className="border-t border-gray-100 pt-4">
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {t('filters.panelThickness')}
        </h4>
        <Select
          value={currentThickness || 'all'}
          onValueChange={(v) => updateFilter('panelThickness', v === 'all' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('filters.allThicknesses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allThicknesses')}</SelectItem>
            <SelectItem value="7">7-9.5mm (Ultra-thin)</SelectItem>
            <SelectItem value="10">10mm (Thin)</SelectItem>
            <SelectItem value="12">12mm (Standard)</SelectItem>
            <SelectItem value="15">15mm (Thick)</SelectItem>
            <SelectItem value="20">20mm (Slab)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search filter */}
      <div className="border-t border-gray-100 pt-4">
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {t('filters.search')}
        </h4>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t('filters.searchPlaceholder')}
            value={searchInput}
            className="pl-9"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
