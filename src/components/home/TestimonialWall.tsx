import { contentService } from '@/lib/services/contentService';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Star } from 'lucide-react';

export async function TestimonialWall() {
  const testimonials = await contentService.getTestimonials(6);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <SectionTitle
          eyebrow="Testimonials"
          title="What Our Clients Say"
          description="Trusted by leading tile brands, distributors, and showroom designers worldwide."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-brand-400 text-brand-400" />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-gray-700">
                &ldquo;{t.content}&rdquo;
              </p>
              <div>
                <div className="font-semibold text-gray-900">
                  {t.customerName}
                </div>
                <div className="text-sm text-gray-500">
                  {t.company} · {t.country}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
