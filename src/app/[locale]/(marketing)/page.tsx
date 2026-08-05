import { HeroBanner } from '@/components/home/HeroBanner';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { SeriesNavigation } from '@/components/home/SeriesNavigation';
import { ShowroomGallery } from '@/components/home/ShowroomGallery';
import { CoreAdvantages } from '@/components/home/CoreAdvantages';
import { StatsSection } from '@/components/home/StatsSection';
import { TestimonialWall } from '@/components/home/TestimonialWall';
import { ClientLogos } from '@/components/home/ClientLogos';
import { CTASection } from '@/components/home/CTASection';
import { ORGANIZATION_JSONLD } from '@/lib/constants/seo';
import { isLocale, type Locale } from '@/lib/i18n/config';

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
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
