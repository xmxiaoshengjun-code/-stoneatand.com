import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { isLocale, localizePath, type Locale } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: 'Inquiry Submitted',
  description: 'Thank you for your inquiry. We will respond within 24 hours.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function InquirySuccessPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="container-custom py-12">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Thank You for Your Inquiry!
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Your inquiry has been submitted successfully. Our sales team will
            contact you within 24 hours with a detailed response.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="brand" size="lg">
              <Link href={lh('/products')}>Continue Browsing</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={lh('/')}>Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
