'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { PARENT_CATEGORIES } from '@/lib/constants/series';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizePath } from '@/lib/i18n/config';

export function SeriesNavigation() {
  const { locale, t } = useI18n();
  const lh = (href: string) => localizePath(href, locale);
  const displayCategories = PARENT_CATEGORIES;

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <SectionTitle
          eyebrow={t('series.eyebrow')}
          title={t('series.title')}
          description={t('series.description')}
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayCategories.map((category) => (
            <Link
              key={category.slug}
              href={lh(`/products?series=${category.slug}`)}
              className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {category.heroImage ? (
                  <Image
                    src={category.heroImage}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-brand-50 text-4xl font-semibold text-brand-300">
                    {category.name.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-5 text-white">
                  <h3 className="text-xl font-medium tracking-[-0.01em]">{category.name}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-white/80">{category.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="brand">
            <Link href={lh('/products')}>
              {t('series.browseAll')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
