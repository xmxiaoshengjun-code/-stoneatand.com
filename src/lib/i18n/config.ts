/**
 * Internationalization configuration.
 */

export const LOCALES = ['en', 'fr', 'de', 'it', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, { label: string; flag: string; full: string }> = {
  en: { label: 'English', flag: '🇬🇧', full: 'English' },
  fr: { label: 'Français', flag: '🇫🇷', full: 'Français' },
  de: { label: 'Deutsch', flag: '🇩🇪', full: 'Deutsch' },
  it: { label: 'Italiano', flag: '🇮🇹', full: 'Italiano' },
  es: { label: 'Español', flag: '🇪🇸', full: 'Español' },
};

export const LOCALE_COOKIE = 'NEXT_LOCALE';

/**
 * Check if a string is a valid locale.
 */
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Get the locale from a URL pathname.
 * Returns null if no locale prefix is found.
 */
export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) {
    return segments[0];
  }
  return null;
}

/**
 * Prefix a path with the given locale.
 * Example: localizePath('/about', 'fr') → '/fr/about'
 *          localizePath('/', 'en') → '/en'
 */
export function localizePath(path: string, locale: Locale): string {
  // Strip query string for processing
  const [pathname, query] = path.split('?');
  const segments = pathname.split('/').filter(Boolean);

  // If already starts with a locale, replace it
  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }

  const newPath = '/' + segments.join('/');
  return query ? `${newPath}?${query}` : newPath;
}

/**
 * Strip the locale prefix from a pathname.
 * Example: stripLocale('/en/about') → '/about'
 *          stripLocale('/fr/products?series=sg') → '/products?series=sg'
 */
export function stripLocale(path: string): string {
  const [pathname, query] = path.split('?');
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0])) {
    segments.shift();
  }

  const newPath = '/' + segments.join('/');
  return query ? `${newPath}?${query}` : newPath;
}

/**
 * Generate hreflang alternates metadata for a given path (without locale prefix).
 * Returns an object suitable for spreading into a Next.js Metadata `alternates` field.
 * Example: buildAlternates('/products') →
 *   { languages: { en: '/en/products', fr: '/fr/products', ..., 'x-default': '/en/products' } }
 */
export function buildAlternates(pathWithoutLocale: string) {
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = localizePath(pathWithoutLocale, loc);
  }
  languages['x-default'] = localizePath(pathWithoutLocale, DEFAULT_LOCALE);
  return { languages };
}
