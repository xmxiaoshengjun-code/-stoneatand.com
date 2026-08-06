import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LOCALES, isLocale, buildAbsoluteAlternates, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { LangSetter } from '@/components/common/LangSetter';
import { settingsService } from '@/lib/services/settingsService';
import { SITE_CONFIG } from '@/lib/constants/seo';

/**
 * Generates dynamic metadata including favicon and hreflang alternates.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const favicon = await settingsService.get('siteFavicon');
    const icons = favicon
      ? { icon: favicon, shortcut: favicon, apple: favicon }
      : undefined;
    return {
      icons,
      alternates: {
        canonical: `${SITE_CONFIG.url}/en`,
        ...buildAbsoluteAlternates('/'),
      },
    };
  } catch {
    return {};
  }
}

export function generateStaticParams() {  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  return (
    <I18nProvider locale={locale} dict={dict}>
      <LangSetter locale={locale} />
      {children}
    </I18nProvider>
  );
}
