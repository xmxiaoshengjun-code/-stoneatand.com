'use client';

import { useEffect } from 'react';
import type { Locale } from '@/lib/i18n/config';

/**
 * Updates the <html lang> attribute to match the current locale.
 * This runs client-side because the root layout sets lang="en" by default.
 */
export function LangSetter({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
