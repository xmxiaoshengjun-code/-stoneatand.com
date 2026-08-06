import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Eye, Target, Compass, Heart, Flame, Users, Star, Shield,
  Factory, Palette, Briefcase, CheckCircle2, ArrowRight,
  Building2, Wrench, Layers, Sparkles, DollarSign,
} from 'lucide-react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { StatsSection } from '@/components/home/StatsSection';
import { CoreAdvantages } from '@/components/home/CoreAdvantages';
import { Button } from '@/components/ui/button';
import {
  CORPORATE_CULTURE,
  ENTERPRISE_TIMELINE,
  PROFESSIONAL_TEAMS,
  MANUFACTURING_CAPABILITIES,
  CERTIFICATIONS,
  PARTNER_BRANDS,
  SITE_CONFIG,
} from '@/lib/constants/seo';
import { isLocale, localizePath, buildAbsoluteAlternates, buildCanonical, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    "Founded in 2008, TSIANFAN is China's benchmark enterprise for tile, stone and wood-flooring display racks. 18+ years of manufacturing excellence, serving 80+ countries with OEM/ODM custom solutions.",
  alternates: {
    canonical: buildCanonical('/about'),
    ...buildAbsoluteAlternates('/about'),
  },
};

const CULTURE_ICONS: Record<string, typeof Eye> = {
  eye: Eye,
  target: Target,
  compass: Compass,
  heart: Heart,
  flame: Flame,
  users: Users,
  star: Star,
  shield: Shield,
};

const TEAM_ICONS: Record<string, typeof Factory> = {
  factory: Factory,
  palette: Palette,
  handshake: Briefcase,
};

const CAPABILITY_ICONS = [Building2, Wrench, Layers, Sparkles, Factory, DollarSign];

export default async function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);
  const dict = await getDictionary(locale);
  const t = dict.about || {};
  const tc = dict.common || {};
  return (
    <main className="min-h-screen bg-white">
      <BreadcrumbJsonLd
        items={[
          { label: 'Home', href: lh('/') },
          { label: 'About' },
        ]}
      />
      {/* ── Hero ── */}
      <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/showrooms/ai-showroom-featured.png"
            alt="TSIANFAN tile display showroom"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/80" />
        </div>
        <div className="container-custom relative z-10 py-20 text-center text-white">
          <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-brand-400" />
            Established 2008 · Xiamen, China
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.15] tracking-[-0.02em] md:text-5xl lg:text-6xl">
            About <span className="text-brand-400">TSIANFAN</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 md:text-xl">
            China&apos;s benchmark enterprise for building-materials display props —
            the first service provider focused on stone, tile, and wood-flooring display
            R&D, production, and sales.
          </p>
        </div>
      </section>

      {/* ── Breadcrumb ── */}
      <div className="container-custom pt-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: lh('/') },
            { label: 'About' },
          ]}
        />
      </div>

      {/* ── Company Introduction ── */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/images/showrooms/ai-showroom-advantages.png"
                  alt="TSIANFAN manufacturing facility and showroom"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 hidden rounded-xl border border-white/20 bg-gray-900 p-5 text-white shadow-xl md:block">
                <div className="text-3xl font-bold text-brand-400">100+</div>
                <div className="text-sm text-gray-300">Brand partners worldwide</div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-400">
                {t.storyEyebrow || 'Our Story'}
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.01em] text-gray-900 md:text-4xl">
                {t.storyTitle || '18 Years of Display-Rack Excellence'}
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-gray-600">
                <p>
                  TSIANFAN (Xiamen) Industry & Trade Co., Ltd. is located in Xiamen,
                  the earliest special economic zone developed in China. Founded in 2008,
                  it is the benchmark enterprise of China&apos;s building-materials display
                  props and the first service provider focusing on stone, tile, wood-flooring
                  display design, R&D, production, and sales.
                </p>
                <p>
                  80% of the company&apos;s products are sold to well-known brand companies
                  in Europe and the United States. Our business covers the US, UK, Canada,
                  France, Italy, Germany, and other developed countries. We have won the
                  support and trust of many partners including{' '}
                  <span className="font-semibold text-gray-800">
                    TCE, NEOLITH, COLOR QUARTZ, CAESARSTONE, CERALSIO, VICOSTONE, VIATERA,
                    COSMOS, SOCI
                  </span>{' '}
                  and 100+ well-known brands.
                </p>
                <p>
                  We have complete iron, wood production and manufacturing equipment,
                  large-scale automation professional equipment, and a supporting powder
                  coating line. From pre-structural design, process development, and mold
                  production to shipment and after-sales service, we provide professional
                  one-stop solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Corporate Culture ── */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-400">
              {t.cultureEyebrow || 'Corporate Culture'}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.01em] text-gray-900 md:text-4xl">
              {t.cultureTitle || 'Values That Drive Us Forward'}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t.cultureSubtitle || '"People-oriented, the pursuit of excellence, creating value for society."'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CORPORATE_CULTURE.map((item) => {
              const Icon = CULTURE_ICONS[item.icon] || Star;
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:bg-brand-400">
                    <Icon className="h-6 w-6 text-brand-400 transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Enterprise Timeline ── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-400">
              {t.timelineEyebrow || 'Our Journey'}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.01em] text-gray-900 md:text-4xl">
              {t.timelineTitle || 'Enterprise History'}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t.timelineSubtitle || 'To move forward with one heart and one mind toward the goal is an insatiable faith and the spirit of perfection.'}
            </p>
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute left-0 right-0 top-8 h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />
              <div className="grid grid-cols-6 gap-4">
                {ENTERPRISE_TIMELINE.map((item, idx) => (
                  <div key={item.year} className="relative pt-16">
                    <div
                      className={`absolute top-6 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white ${
                        idx === 0
                          ? 'bg-brand-500 ring-4 ring-brand-100'
                          : idx === ENTERPRISE_TIMELINE.length - 1
                          ? 'bg-brand-500 ring-4 ring-brand-100'
                          : 'bg-brand-300'
                      }`}
                    />
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="mb-1 text-lg font-bold text-brand-400">{item.year}</div>
                      <div className="mb-2 text-sm font-semibold text-gray-900">{item.title}</div>
                      <p className="text-xs leading-relaxed text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: vertical timeline */}
          <div className="lg:hidden">
            <div className="relative border-l-2 border-brand-200 pl-8">
              {ENTERPRISE_TIMELINE.map((item) => (
                <div key={item.year} className="relative mb-8 last:mb-0">
                  <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-2 border-white bg-brand-400" />
                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-1 text-lg font-bold text-brand-400">{item.year}</div>
                    <div className="mb-2 text-sm font-semibold text-gray-900">{item.title}</div>
                    <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Professional Teams ── */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-400">
              {t.teamsEyebrow || 'Our People'}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.01em] text-gray-900 md:text-4xl">
              {t.teamsTitle || 'Professional Teams'}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t.teamsSubtitle || 'Adhering to "practical, convenient, honest, innovative" business philosophy to serve customers worldwide.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PROFESSIONAL_TEAMS.map((team) => {
              const Icon = TEAM_ICONS[team.icon] || Users;
              return (
                <div
                  key={team.title}
                  className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl"
                >
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 transition-colors group-hover:bg-brand-400">
                    <Icon className="h-7 w-7 text-brand-400 transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-gray-900">{team.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{team.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Manufacturing Capabilities ── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-400">
                {t.manufacturingEyebrow || 'Manufacturing'}
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.01em] text-gray-900 md:text-4xl">
                {t.manufacturingTitle || 'Production Capabilities'}
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                {t.manufacturingSubtitle || 'A 10,000+ sqm production workshop with complete iron and wood manufacturing equipment, large-scale automation, and an in-house powder coating line.'}
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {MANUFACTURING_CAPABILITIES.map((cap, idx) => {
                  const Icon = CAPABILITY_ICONS[idx] || Factory;
                  return (
                    <div key={cap.title} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                          <Icon className="h-5 w-5 text-brand-400" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{cap.title}</h4>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">{cap.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/images/showrooms/ai-showroom-detail.png"
                  alt="TSIANFAN production workshop and equipment"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-white/20 bg-gray-900 p-5 text-white shadow-xl md:block">
                <div className="text-3xl font-bold text-brand-400">10K+</div>
                <div className="text-sm text-gray-300">sqm workshop</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats (reuse) ── */}
      <StatsSection />

      {/* ── Certifications ── */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-400">
              {t.certEyebrow || 'Quality Assurance'}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.01em] text-gray-900 md:text-4xl">
              {t.certTitle || 'Certifications & Patents'}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t.certSubtitle || 'Certified quality systems and recognized industry credentials.'}
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-brand-400" />
                <span className="text-sm font-medium text-gray-800">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner Brands ── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-400">
              {t.partnersEyebrow || 'Trusted By'}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.01em] text-gray-900 md:text-4xl">
              {t.partnersTitle || 'Partner Brands'}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t.partnersSubtitle || '80% of our products are exported to well-known brand companies in Europe and America. Our customers include 100+ well-known brands worldwide.'}
            </p>
          </div>

          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4">
            {PARTNER_BRANDS.map((brand) => (
              <div
                key={brand}
                className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-4 text-center shadow-sm transition-all hover:border-brand-300 hover:bg-white hover:shadow-md"
              >
                <span className="text-sm font-bold tracking-wide text-gray-700">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Advantages (reuse) ── */}
      <CoreAdvantages />

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-20 text-white md:py-28">
        <div className="absolute inset-0">
          <Image
            src="/images/showrooms/ai-showroom-cta.png"
            alt="Contact TSIANFAN for custom display solutions"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gray-900/80" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.01em] md:text-4xl lg:text-5xl">
            {t.ctaTitle || 'Ready to Elevate Your Showroom?'}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            {t.ctaSubtitle || 'From concept to installation, TSIANFAN provides professional one-stop display solutions tailored to your brand. Get in touch today.'}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="xl" className="bg-brand-400 text-white hover:bg-brand-500">
              <Link href={lh('/contact')}>
                {tc.requestQuote || 'Request a Quote'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Link href={lh('/products')}>{tc.browseProducts || 'Browse Products'}</Link>
            </Button>
          </div>
          <p className="mt-8 text-sm text-white/60">
            {SITE_CONFIG.email} · {SITE_CONFIG.phone} · WhatsApp: {SITE_CONFIG.whatsapp}
          </p>
        </div>
      </section>
    </main>
  );
}
