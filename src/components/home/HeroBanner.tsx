'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizePath } from '@/lib/i18n/config';

export function HeroBanner() {
  const { locale, t } = useI18n();
  const lh = (href: string) => localizePath(href, locale);

  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
      {/* Full-bleed showroom background */}
      <div className="absolute inset-0">
        <Image
          src="/images/showrooms/ai-hero-showroom.png"
          alt="Premium tile showroom display racks"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 px-4 pt-20 pb-28 text-center text-white sm:px-6 lg:px-8">
        <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-normal backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-brand-400" />
          {t('hero.badge')}
        </p>

        <h1 className="mx-auto max-w-4xl text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-5xl md:text-6xl lg:text-7xl">
          {t('hero.title')}
          <span className="block font-medium text-brand-300">{t('hero.titleHighlight')}</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-white/75 sm:text-lg md:text-xl">
          {t('hero.subtitle')}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="xl" className="bg-brand-400 text-white hover:bg-brand-500">
            <Link href={lh('/products')}>
              {t('hero.ctaPrimary')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="xl"
            variant="outline"
            className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
          >
            <Link href={lh('/contact')}>{t('hero.ctaSecondary')}</Link>
          </Button>
        </div>

        {/* Trust line */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-white/70">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            {t('hero.trust1')}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            {t('hero.trust2')}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            {t('hero.trust3')}
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/60">
        <ChevronDown className="h-8 w-8" />
      </div>
    </section>
  );
}
