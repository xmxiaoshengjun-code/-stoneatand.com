import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { CompareBar } from '@/components/product/CompareBar';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductSpecTable } from '@/components/product/ProductSpecTable';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { InquiryButton } from '@/components/inquiry/InquiryButton';
import { CompareButton } from '@/components/product/CompareButton';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { ShareButtons } from '@/components/common/ShareButtons';
import { Badge } from '@/components/ui/badge';
import { productService } from '@/lib/services/productService';
import { SITE_CONFIG } from '@/lib/constants/seo';
import { LOCALES, isLocale, localizePath, buildAbsoluteAlternates, buildCanonical, type Locale } from '@/lib/i18n/config';
import { SERIES_BY_SLUG, buildProductDetailPath } from '@/lib/constants/series';

interface PageProps {
  params: { slug: string; sku: string; locale: string };
}

// Localized CTA suffixes for product description
const PRODUCT_CTA: Record<Locale, string> = {
  en: 'Request a quote from TSIANFAN, 18+ years display rack manufacturer. OEM/ODM custom solutions.',
  fr: "Demandez un devis à TSIANFAN, fabricant de présentoirs avec plus de 18 ans d'expérience. Solutions OEM/ODM sur mesure.",
  de: 'Fordern Sie ein Angebot von TSIANFAN an, Display-Rack-Hersteller mit über 18 Jahren Erfahrung. OEM/ODM-Kundlösungen.',
  it: 'Richiedi un preventivo a TSIANFAN, produttore di espositori con oltre 18 anni di esperienza. Soluzioni OEM/ODM personalizzate.',
  es: 'Solicite una cotización a TSIANFAN, fabricante de expositores con más de 18 años de experiencia. Soluciones OEM/ODM personalizadas.',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const series = SERIES_BY_SLUG[params.slug];
  if (!series) return { title: 'Product Not Found' };

  const product = await productService.getProductBySku(params.sku);
  if (!product) return { title: 'Product Not Found' };

  // Validate that the product's series matches the URL slug
  if (product.series?.slug !== params.slug) return { title: 'Product Not Found' };

  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const skuLower = product.sku.toLowerCase();
  const path = `/products/${params.slug}/${skuLower}`;
  const cta = PRODUCT_CTA[locale];

  const description = `${product.name} (${product.sku}) - ${product.series?.name || 'Display Rack'} display rack. ${product.description || product.features || ''} ${cta}`;

  return {
    title: `${product.name} (${product.sku})`,
    description,
    alternates: {
      canonical: buildCanonical(path, locale),
      ...buildAbsoluteAlternates(path),
    },
  };
}

export async function generateStaticParams() {
  // Fetch ALL products (not just the first 100) to ensure every product
  // detail page is pre-rendered with the correct series-slug + sku combination.
  const allEntries: Array<{ sku: string; slug: string }> = [];
  let page = 1;
  const pageSize = 50;
  // Paginate through all products to avoid memory issues with a single large query
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const batch = await productService.getProducts({ page, pageSize, sort: 'sortOrder' });
    if (!batch.items || batch.items.length === 0) break;
    for (const product of batch.items) {
      const seriesSlug = product.series?.slug;
      if (!seriesSlug) continue; // Skip products without a series (should not happen)
      allEntries.push({ sku: product.sku.toLowerCase(), slug: seriesSlug });
    }
    if (batch.items.length < pageSize) break;
    page++;
  }

  const params: { locale: string; slug: string; sku: string }[] = [];
  for (const entry of allEntries) {
    for (const locale of LOCALES) {
      params.push({ locale, slug: entry.slug, sku: entry.sku });
    }
  }
  return params;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);

  // Validate slug is a known child series
  const series = SERIES_BY_SLUG[params.slug];
  if (!series) notFound();

  const product = await productService.getProductBySku(params.sku);
  if (!product) notFound();

  // Validate that the product's series matches the URL slug (prevents URL spoofing)
  if (product.series?.slug !== params.slug) notFound();

  const related = await productService.getRelatedProducts(product.id, product.seriesId, 4);
  const shareUrl = `${SITE_CONFIG.url}${lh(buildProductDetailPath(product.sku, product.series?.slug))}`;

  // Build image URLs for JSON-LD (filter out invalid/empty urls defensively)
  const productImages = (product.images || [])
    .filter((img) => img.url)
    .map((img) => (img.url.startsWith('http') ? img.url : `${SITE_CONFIG.url}${img.url}`));

  // Breadcrumb items (shared between visual and JSON-LD)
  // Third item links to the child series product list page
  const seriesName = product.series?.name || series.name;
  const seriesSlug = product.series?.slug || series.slug;
  const breadcrumbItems = [
    { label: 'Home', href: lh('/') },
    { label: 'Products', href: lh('/products') },
    ...(seriesName
      ? [{ label: seriesName, href: lh(`/products/${seriesSlug}`) }]
      : []),
    { label: product.sku },
  ];

  return (
    <>
      <ProductJsonLd product={product} images={productImages} priceRange="$$" />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <main className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Gallery */}
            <ProductGallery images={(product.images || []).filter((img) => img.url)} />

            {/* Info */}
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-base">
                    {product.sku}
                  </Badge>
                  <CompareButton sku={product.sku} />
                  {product.isFeatured && (
                    <Badge variant="brand">Featured</Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  {product.name}
                </h1>
                {product.series && (
                  <p className="mt-1 text-sm text-gray-500">
                    Series: {product.series.name}
                  </p>
                )}
              </div>

              {product.description && (
                <p className="text-gray-700">{product.description}</p>
              )}

              {product.features && (
                <div className="rounded-lg border bg-brand-50 p-4">
                  <h3 className="mb-2 font-semibold text-brand-700">Key Features</h3>
                  {(() => {
                    try {
                      const features = JSON.parse(product.features);
                      if (Array.isArray(features)) {
                        return (
                          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                            {features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                          </ul>
                        );
                      }
                    } catch { /* fall through to text */ }
                    return <p className="text-sm text-gray-700">{product.features}</p>;
                  })()}
                </div>
              )}

              {/* Quick specs */}
              <div className="grid grid-cols-2 gap-4">
                {product.standSize && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Stand Size</p>
                    <p className="text-sm font-medium">{product.standSize} mm</p>
                  </div>
                )}
                {product.panelSize && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Panel Size</p>
                    <p className="text-sm font-medium">{product.panelSize}</p>
                  </div>
                )}
                {product.panelThickness && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Thickness</p>
                    <p className="text-sm font-medium">{product.panelThickness}</p>
                  </div>
                )}
                {product.packageSize && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Package Size</p>
                    <p className="text-sm font-medium">{product.packageSize} mm</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <InquiryButton productId={product.id} productSku={product.sku} />
                <ShareButtons url={shareUrl} title={`${product.name} (${product.sku})`} />
              </div>
            </div>
          </div>

          {/* Full spec table */}
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Full Specifications
            </h2>
            <ProductSpecTable product={product} />
          </div>

          {/* Related products */}
          {related && related.length > 0 && <RelatedProducts products={related} />}
        </div>
      </main>
      <CompareBar />
    </>
  );
}
