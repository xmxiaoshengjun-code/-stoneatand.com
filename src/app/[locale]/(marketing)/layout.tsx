import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { CookieConsent } from '@/components/common/CookieConsent';
import { Analytics } from '@/components/common/Analytics';
import { CopyProtection } from '@/components/common/CopyProtection';
import { buildAbsoluteAlternates, buildCanonical } from '@/lib/i18n/config';

/**
 * Marketing layout metadata: canonical and hreflang tags for SEO/GEO.
 */
export const metadata: Metadata = {
  alternates: {
    canonical: buildCanonical('/'),
    ...buildAbsoluteAlternates('/'),
  },
};

/**
 * Marketing layout — shared chrome for all public-facing pages.
 * Rendered inside the [locale] layout which provides I18nProvider.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
      <ChatWidget />
      <CookieConsent />
      <Analytics />
      <CopyProtection />
    </>
  );
}
