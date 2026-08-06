import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants/seo';
import { isLocale, localizePath, buildAbsoluteAlternates, buildCanonical, type Locale } from '@/lib/i18n/config';

export function generateMetadata(): Metadata {
  return {
    title: 'Contact Us',
    description: 'Contact TSIANFAN for tile display rack inquiries, custom solutions, and partnership opportunities. 18+ years experience, 80+ countries served.',
    alternates: {
      canonical: buildCanonical('/contact'),
      ...buildAbsoluteAlternates('/contact'),
    },
  };
}

export default function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);

  const breadcrumbItems = [
    { label: 'Home', href: lh('/') },
    { label: 'Contact' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="container-custom py-8">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Contact Us</h1>
        <p className="mb-8 text-gray-600">
          Ready to elevate your tile showroom? Get in touch with our team.
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Contact info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5 text-brand-400" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">General inquiries:</p>
                <a href={`mailto:${SITE_CONFIG.email}`} className="text-brand-400 hover:underline">
                  {SITE_CONFIG.email}
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="h-5 w-5 text-brand-400" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Call us directly:</p>
                <p className="font-medium">{SITE_CONFIG.phone}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-brand-400" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{SITE_CONFIG.address}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-brand-400" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{SITE_CONFIG.businessHours}</p>
              </CardContent>
            </Card>
          </div>

          {/* Inquiry form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <InquiryForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
