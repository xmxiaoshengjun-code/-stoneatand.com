import Image from 'next/image';
import { SectionTitle } from '@/components/common/SectionTitle';

const SHOWROOM_IMAGES = [
  {
    src: '/images/showrooms/ai-showroom-featured.png',
    alt: 'Modern ceramic tile showroom with wall displays',
    caption: 'Immersive Showroom',
  },
  {
    src: '/images/showrooms/ai-showroom-detail.png',
    alt: 'Close-up of premium tile display rack',
    caption: 'Premium Details',
  },
];

export function ShowroomGallery() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <SectionTitle
          eyebrow="Showroom Inspiration"
          title="Designed to Sell"
          description="See how professional display systems transform exhibition spaces into immersive brand experiences."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {SHOWROOM_IMAGES.map((img, idx) => (
            <div
              key={idx}
              className="group relative aspect-[16/10] overflow-hidden rounded-2xl shadow-lg"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                <p className="text-lg font-semibold tracking-tight">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
