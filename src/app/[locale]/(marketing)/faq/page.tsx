import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { SectionTitle } from '@/components/common/SectionTitle';
import { contentService } from '@/lib/services/contentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isLocale, localizePath, buildAbsoluteAlternates, buildCanonical, type Locale } from '@/lib/i18n/config';

export function generateMetadata(): Metadata {
  return {
    title: 'FAQ',
    description: 'Frequently asked questions about TSIANFAN tile display racks, custom solutions, shipping and more.',
    alternates: {
      canonical: buildCanonical('/faq'),
      ...buildAbsoluteAlternates('/faq'),
    },
  };
}

export default async function FAQPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);
  const faqs = await contentService.getFAQs();

  // Group by category
  const grouped = faqs.reduce(
    (acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = [];
      acc[faq.category].push(faq);
      return acc;
    },
    {} as Record<string, typeof faqs>
  );

  // Build FAQPage JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbItems = [
    { label: 'Home', href: lh('/') },
    { label: 'FAQ' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container-custom py-8">
        <Breadcrumb items={breadcrumbItems} />
        <SectionTitle
          eyebrow="Help Center"
          title="Frequently Asked Questions"
          description="Find answers to common questions about our products and services."
        />

        <div className="mt-12 space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">{category}</h2>
              <div className="space-y-4">
                {items.map((faq) => (
                  <Card key={faq.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
