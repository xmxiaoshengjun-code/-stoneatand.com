'use client';

import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Get a nested value from an object using a dot-separated path.
 */
function getPath(obj: unknown, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return the key itself if not found
    }
  }
  return typeof current === 'string' ? current : path;
}

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const t = useCallback((path: string) => getPath(dict, path), [dict]);

  // Memoize the context value so consumers don't re-render unnecessarily.
  // Without this, a new object is created on every provider render, causing
  // all useI18n() consumers to re-render even when locale/dict/t are unchanged.
  const value = useMemo(() => ({ locale, dict, t }), [locale, dict, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

/**
 * Convenience hook for just the translation function.
 */
export function useT() {
  return useI18n().t;
}
