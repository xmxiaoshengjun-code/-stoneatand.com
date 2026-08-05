import Image from 'next/image';
import { COMPANY_STATS } from '@/lib/constants/seo';

export function StatsSection() {
  return (
    <section className="relative overflow-hidden py-24 text-white md:py-32">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/showrooms/ai-showroom-stats.png"
          alt="Modern tile showroom with custom displays"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gray-900/80" />
      </div>

      <div className="container-custom relative z-10">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Numbers That Speak</h2>
          <p className="mt-3 text-base text-white/70 sm:text-lg">
            Built on nearly two decades of display-rack manufacturing and global exports.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-5">
          {COMPANY_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-brand-300 sm:text-4xl md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium text-white/80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
