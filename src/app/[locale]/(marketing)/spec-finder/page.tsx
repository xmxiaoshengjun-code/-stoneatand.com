import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { SectionTitle } from '@/components/common/SectionTitle';
import { SpecFinderClient } from './SpecFinderClient';
import { isLocale, localizePath, buildAbsoluteAlternates, buildCanonical, type Locale } from '@/lib/i18n/config';

export function generateMetadata(): Metadata {
  return {
    title: 'Spec Finder - Find Your Perfect Display Rack',
    description: 'Enter your tile dimensions and find the perfect display rack in seconds. TSIANFAN offers 172+ display rack models across 17 series.',
    alternates: {
      canonical: buildCanonical('/spec-finder'),
      ...buildAbsoluteAlternates('/spec-finder'),
    },
  };
}

export default function SpecFinderPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);

  const breadcrumbItems = [
    { label: 'Home', href: lh('/') },
    { label: 'Spec Finder' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="container-custom py-8">
        <Breadcrumb items={breadcrumbItems} />
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
