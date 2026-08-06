import type { Metadata } from 'next';
import { HeroBanner } from '@/components/home/HeroBanner';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { SeriesNavigation } from '@/components/home/SeriesNavigation';
import { ShowroomGallery } from '@/components/home/ShowroomGallery';
import { CoreAdvantages } from '@/components/home/CoreAdvantages';
import { StatsSection } from '@/components/home/StatsSection';
import { TestimonialWall } from '@/components/home/TestimonialWall';
import { ClientLogos } from '@/components/home/ClientLogos';
import { CTASection } from '@/components/home/CTASection';
import { ORGANIZATION_JSONLD, SITE_CONFIG } from '@/lib/constants/seo';
import { isLocale, buildAbsoluteAlternates, buildCanonical, type Locale } from '@/lib/i18n/config';

/**
 * Generates SEO metadata for the homepage with localized title/description and hreflang alternates.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';

  return {
    title: 'TSIANFAN - Premium Tile Display Rack Manufacturer | 172+ SKUs, 17 Series',
    description:
      'TSIANFAN manufactures display racks for tile, stone, wood flooring, mosaic, carpet and more. 172+ SKUs across 17 series. 18+ years experience, 80+ countries served. OEM/ODM custom solutions.',
    alternates: {
      canonical: buildCanonical('/', locale),
      ...buildAbsoluteAlternates('/'),
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';

  // WebSite JSON-LD with Sitelinks Search Box
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.fullName,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/en/products?keyword={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <main>
        <HeroBanner />
        <FeaturedProducts locale={locale} />
        <SeriesNavigation />
        <ShowroomGallery />
        <CoreAdvantages />
        <StatsSection />
        <ClientLogos />
        <TestimonialWall />
        <CTASection />
      </main>
    </>
  );
}
