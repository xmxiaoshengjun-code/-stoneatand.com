'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizePath } from '@/lib/i18n/config';

export function CTASection() {
  const { locale, t } = useI18n();
  const lh = (href: string) => localizePath(href, locale);

  return (
    <section className="relative overflow-hidden py-24 text-white md:py-32">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/showrooms/ai-showroom-cta.png"
          alt="High-end tile showroom display system"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/70" />
      </div>

      <div className="container-custom relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-5xl">
            {t('cta.title')}
          </h2>
          <p className="mb-10 text-lg text-white/75 md:text-xl">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="xl" className="bg-brand-400 text-white hover:bg-brand-500">
              <Link href={lh('/contact')}>
                <MessageSquare className="mr-2 h-5 w-5" />
                {t('common.requestQuote')}
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Link href={lh('/spec-finder')}>
                {t('cta.findRack')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
