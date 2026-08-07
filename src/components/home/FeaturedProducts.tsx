import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { productService } from '@/lib/services/productService';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Button } from '@/components/ui/button';
import { localizePath, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { buildProductDetailPath } from '@/lib/constants/series';
import type { Product } from '@/types/product';

function FeaturedProductCard({ product, locale, dict }: { product: Product; locale: Locale; dict: any }) {
  const image = product.images?.[0];
  const seriesName = product.series?.name || '';

  return (
    <Link
      href={localizePath(buildProductDetailPath(product.sku, product.series?.slug), locale)}
      className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-semibold text-gray-300">
            {product.sku.slice(0, 2)}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
          <span className="text-sm font-medium text-white">{dict.featured?.viewDetails || 'View Details'} &rarr;</span>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.15em] text-brand-400">
          {seriesName}
        </div>
        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-brand-400">
          {product.name}
        </h3>
        <p className="text-xs font-mono text-gray-500">{product.sku}</p>
      </div>
    </Link>
  );
}

export async function FeaturedProducts({ locale }: { locale: Locale }) {
  const products = await productService.getFeaturedProducts(6);
  const dict = await getDictionary(locale);
  const totalCount = await productService.getProductCount();

  if (!products || products.length === 0) return null;

  const browseAllText = (dict.featured?.browseAll || 'Browse All {count} Products').replace('{count}', String(totalCount || 172));

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Banner header with showroom image */}
      <div className="relative py-16 text-white md:py-24">
        <div className="absolute inset-0">
          <Image
            src="/images/showrooms/ai-showroom-featured.png"
            alt="Tile showroom display racks banner"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gray-900/75" />
        </div>
        <div className="container-custom relative z-10">
          <SectionTitle
            eyebrow={dict.featured?.eyebrow || 'Featured Displays'}
            title={dict.featured?.title || 'Best-Selling Display Racks'}
            description={dict.featured?.description || 'Real products from our catalog, ready to ship.'}
            light
          />
        </div>
      </div>

      {/* Product grid */}
      <div className="container-custom -mt-8 relative z-20 pb-16 md:pb-20">
        <div className="rounded-2xl bg-white p-5 shadow-xl md:p-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <FeaturedProductCard key={product.id} product={product} locale={locale} dict={dict} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button asChild size="lg" variant="brand">
              <Link href={localizePath('/products', locale)}>
                {browseAllText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
