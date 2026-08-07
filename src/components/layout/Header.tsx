'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants/nav';
import { PARENT_CATEGORIES, getChildSeries } from '@/lib/constants/series';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SearchModal } from '@/components/common/SearchModal';
import { Logo } from '@/components/common/Logo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizePath, stripLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileExpandedParent, setMobileExpandedParent] = useState<string | null>(null);
  const pathname = usePathname();
  const { locale, t } = useI18n();

  // Strip locale from pathname for active nav comparison
  const pathWithoutLocale = stripLocale(pathname);

  // Helper to localize any href
  const lh = (href: string) => localizePath(href, locale);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container-custom flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={lh('/')} className="flex items-center">
            <Logo className="h-7 text-brand-400" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const isProductsNav = item.href === '/products';

              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={lh(item.href)}
                    className={cn(
                      'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                      pathWithoutLocale === item.href && 'text-brand-400'
                    )}
                  >
                    {t(`nav.${item.label.toLowerCase().replace(/\s+/g, '')}`) !==
                    `nav.${item.label.toLowerCase().replace(/\s+/g, '')}`
                      ? t(`nav.${item.label.toLowerCase().replace(/\s+/g, '')}`)
                      : item.label}
                    {item.children ? <ChevronDown className="h-4 w-4" /> : null}
                  </Link>

                  {item.children ? (
                    <div className="absolute left-0 top-full hidden min-w-[220px] pt-1 group-hover:block">
                      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                        {isProductsNav
                          ? // Enhanced Products dropdown: parent categories with child series flyout
                            PARENT_CATEGORIES.map((parent) => {
                              const childSeries = getChildSeries(parent.slug);
                              return (
                                <div
                                  key={parent.slug}
                                  className="group/cat relative"
                                >
                                  <Link
                                    href={lh(`/products/${parent.slug}`)}
                                    className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-brand-400"
                                  >
                                    {parent.name}
                                    {childSeries.length > 0 ? (
                                      <ChevronRight className="h-4 w-4 text-gray-400" />
                                    ) : null}
                                  </Link>
                                  {childSeries.length > 0 ? (
                                    <div className="absolute left-full top-0 hidden min-w-[220px] group-hover/cat:block">
                                      <div className="ml-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                                        <Link
                                          href={lh(`/products/${parent.slug}`)}
                                          className="block border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-400 hover:bg-brand-50"
                                        >
                                          {parent.name}
                                        </Link>
                                        {childSeries.map((child) => (
                                          <Link
                                            key={child.slug}
                                            href={lh(`/products/${child.slug}`)}
                                            className="block px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-brand-400"
                                          >
                                            {child.name}
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })
                          : // Normal dropdown for other nav items
                            item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={lh(child.href)}
                                className="block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-brand-400"
                              >
                                {child.label}
                              </Link>
                            ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <LanguageSwitcher currentLocale={locale} />
            <Button asChild variant="brand" size="sm" className="hidden sm:inline-flex">
              <Link href={lh('/contact')}>{t('common.requestQuote')}</Link>
            </Button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen ? (
          <nav className="border-t bg-white lg:hidden">
            <div className="container-custom max-h-[calc(100vh-4rem)] space-y-1 overflow-y-auto py-4">
              {NAV_ITEMS.map((item) => {
                const isProductsNav = item.href === '/products';

                return (
                  <div key={item.href}>
                    {isProductsNav && item.children ? (
                      // Mobile: Products accordion with parent categories and child series
                      <>
                        <button
                          onClick={() =>
                            setMobileExpandedParent(
                              mobileExpandedParent === '__products__'
                                ? null
                                : '__products__'
                            )
                          }
                          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          {item.label}
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform',
                              mobileExpandedParent === '__products__' && 'rotate-180'
                            )}
                          />
                        </button>
                        {mobileExpandedParent === '__products__' ? (
                          <div className="ml-3 space-y-1 border-l-2 border-gray-100 pl-2">
                            <Link
                              href={lh('/products')}
                              onClick={() => setMobileOpen(false)}
                              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                              All Products
                            </Link>
                            {PARENT_CATEGORIES.map((parent) => {
                              const childSeries = getChildSeries(parent.slug);
                              return (
                                <div key={parent.slug}>
                                  <Link
                                    href={lh(`/products/${parent.slug}`)}
                                    onClick={() => setMobileOpen(false)}
                                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                  >
                                    {parent.name}
                                  </Link>
                                  {childSeries.length > 0 ? (
                                    <div className="ml-3 space-y-0.5">
                                      {childSeries.map((child) => (
                                        <Link
                                          key={child.slug}
                                          href={lh(`/products/${child.slug}`)}
                                          onClick={() => setMobileOpen(false)}
                                          className="block rounded-md px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
                                        >
                                          {child.name}
                                        </Link>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <Link
                          href={lh(item.href)}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          {item.label}
                        </Link>
                        {item.children ? (
                          <div className="ml-4 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={lh(child.href)}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        ) : null}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
