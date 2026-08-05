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
import { ShareButtons } from '@/components/common/ShareButtons';
import { Badge } from '@/components/ui/badge';
import { productService } from '@/lib/services/productService';
import { SITE_CONFIG } from '@/lib/constants/seo';
import { LOCALES, isLocale, localizePath, type Locale } from '@/lib/i18n/config';

interface PageProps {
  params: { sku: string; locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await productService.getProductBySku(params.sku);
  if (!product) return { title: 'Product Not Found' };

  const slug = product.sku.toLowerCase();
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = localizePath(`/products/${slug}`, loc);
  }
  languages['x-default'] = `/en/products/${slug}`;

  return {
    title: `${product.name} (${product.sku})`,
    description: product.description || `Tile display rack ${product.sku} - ${product.features}`,
    alternates: {
      canonical: localizePath(`/products/${slug}`, isLocale(params.locale) ? params.locale : 'en'),
      languages,
    },
  };
}

export async function generateStaticParams() {
  const products = await productService.getProducts({ pageSize: 100 });
  const params: { sku: string; locale: string }[] = [];
  for (const product of products.items) {
    for (const locale of LOCALES) {
      params.push({ sku: product.sku.toLowerCase(), locale });
    }
  }
  return params;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const lh = (href: string) => localizePath(href, locale);

  const product = await productService.getProductBySku(params.sku);
  if (!product) notFound();

  const related = await productService.getRelatedProducts(product.id, product.seriesId, 4);
  const shareUrl = `${SITE_CONFIG.url}${lh('/products')}/${product.sku.toLowerCase()}`;

  return (
    <>
      <ProductJsonLd product={product} />
      <main className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <Breadcrumb
            items={[
              { label: 'Home', href: lh('/') },
              { label: 'Products', href: lh('/products') },
              { label: product.series?.name || '', href: lh(`/products?series=${product.series?.slug}`) },
              { label: product.sku },
            ]}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Gallery */}
            <ProductGallery images={product.images || []} />

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
                  <p className="text-sm text-gray-700">{product.features}</p>
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
          <RelatedProducts products={related} />
        </div>
      </main>
      <CompareBar />
    </>
  );
}
