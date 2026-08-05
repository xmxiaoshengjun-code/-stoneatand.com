'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Search } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants/nav';
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
            {NAV_ITEMS.map((item) => (
              <div key={item.href} className="relative group">
                <Link
                  href={lh(item.href)}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                    pathWithoutLocale === item.href && 'text-brand-400'
                  )}
                >
                  {t(`nav.${item.label.toLowerCase().replace(/\s+/g, '')}`) !== `nav.${item.label.toLowerCase().replace(/\s+/g, '')}`
                    ? t(`nav.${item.label.toLowerCase().replace(/\s+/g, '')}`)
                    : item.label}
                  {item.children && <ChevronDown className="h-4 w-4" />}
                </Link>
                {item.children && (
                  <div className="absolute left-0 top-full hidden min-w-[200px] pt-1 group-hover:block">
                    <div className="rounded-lg border bg-white p-2 shadow-lg">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={lh(child.href)}
                          className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-400"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
        {mobileOpen && (
          <nav className="border-t bg-white lg:hidden">
            <div className="container-custom space-y-1 py-4">
              {NAV_ITEMS.map((item) => (
                <div key={item.href}>
                  <Link
                    href={lh(item.href)}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
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
                  )}
                </div>
              ))}
            </div>
          </nav>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
