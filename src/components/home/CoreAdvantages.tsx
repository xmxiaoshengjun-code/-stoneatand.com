import Image from 'next/image';
import { CORE_ADVANTAGES } from '@/lib/constants/seo';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Award, Package, Globe, Settings } from 'lucide-react';

const ICON_MAP: Record<string, typeof Award> = {
  award: Award,
  package: Package,
  globe: Globe,
  settings: Settings,
};

export function CoreAdvantages() {
  return (
    <section className="section-padding overflow-hidden bg-white">
      <div className="container-custom">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: showroom image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="/images/showrooms/ai-showroom-advantages.png"
                alt="Premium tile showroom interior with display racks"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden rounded-xl border border-white/20 bg-gray-900 p-5 text-white shadow-xl md:block">
              <div className="text-3xl font-bold text-brand-400">18+</div>
              <div className="text-sm text-gray-300">Years of expertise</div>
            </div>
          </div>

          {/* Right: advantages */}
          <div className="order-1 lg:order-2">
            <SectionTitle
              align="left"
              eyebrow="Why Choose Us"
              title="Our Core Advantages"
              description="Eighteen years of dedicated expertise in tile display rack manufacturing, trusted by tile brands worldwide."
            />

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {CORE_ADVANTAGES.map((adv) => {
                const Icon = ICON_MAP[adv.icon] || Award;
                return (
                  <div key={adv.title} className="group">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:bg-brand-400">
                      <Icon className="h-6 w-6 text-brand-400 transition-colors group-hover:text-white" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">
                      {adv.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {adv.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
