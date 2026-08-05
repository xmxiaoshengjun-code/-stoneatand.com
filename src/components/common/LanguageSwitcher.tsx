'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Globe, ChevronDown } from 'lucide-react';
import { LOCALES, LOCALE_NAMES, LOCALE_COOKIE, type Locale } from '@/lib/i18n/config';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Language switcher dropdown component.
 * Updates the locale cookie and navigates to the localized URL.
 * Filters displayed locales based on the enabledLocales setting from /api/public-settings.
 */
export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch enabled locales from public settings
  const { data: settingsData } = useSWR('/api/public-settings', fetcher);
  const enabledLocalesStr: string = settingsData?.data?.enabledLocales || 'en,fr,de,it,es';
  const enabledLocales = enabledLocalesStr
    .split(',')
    .map((l) => l.trim())
    .filter((l) => LOCALES.includes(l as Locale)) as Locale[];

  // Fallback to all locales if none enabled
  const displayLocales = enabledLocales.length > 0 ? enabledLocales : LOCALES;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(newLocale: Locale) {
    // Set cookie
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;

    // Replace locale in pathname
    // pathname is like "/en/about" or "/fr/products"
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && LOCALES.includes(segments[0] as Locale)) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const newPath = '/' + segments.join('/');
    router.push(newPath);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-400"
        aria-label="Switch language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{LOCALE_NAMES[currentLocale].label}</span>
        <span className="sm:hidden">{currentLocale.toUpperCase()}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {displayLocales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                locale === currentLocale ? 'bg-brand-50 text-brand-400 font-medium' : 'text-gray-700'
              }`}
            >
              <span className="text-base">{LOCALE_NAMES[locale].flag}</span>
              <span>{LOCALE_NAMES[locale].full}</span>
              {locale === currentLocale && (
                <span className="ml-auto text-brand-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
