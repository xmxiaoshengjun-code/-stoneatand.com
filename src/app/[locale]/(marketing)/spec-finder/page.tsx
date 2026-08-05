import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { SectionTitle } from '@/components/common/SectionTitle';
import { SpecFinderClient } from './SpecFinderClient';
import { isLocale, localizePath, buildAlternates, type Locale } from '@/lib/i18n/config';

export function generateMetadata(): Metadata {
  return {
    title: 'Spec Finder - Find Your Perfect Display Rack',
    description: 'Enter your tile dimensions and find the perfect display rack in seconds.',
    alternates: buildAlternates('/spec-finder'),
  };
}

export default function SpecFinderPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: lh('/') },
            { label: 'Spec Finder' },
          ]}
        />
        <SectionTitle
          eyebrow="Smart Tool"
          title="Spec Finder"
          description="Enter your tile dimensions and thickness to find the perfect display rack."
        />
        <div className="mt-12">
          <SpecFinderClient />
        </div>
      </div>
    </main>
  );
}
