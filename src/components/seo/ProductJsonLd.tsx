import { SITE_CONFIG } from '@/lib/constants/seo';
import type { Product } from '@/types/product';

/**
 * Renders Product JSON-LD structured data for SEO.
 */
export function ProductJsonLd({ product }: { product: Product }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    description: product.description || product.features || '',
    category: product.series?.name || 'Tile Display Rack',
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name,
    },
    manufacturer: {
      '@type': 'Organization',
      name: SITE_CONFIG.fullName,
      url: SITE_CONFIG.url,
    },
    additionalProperty: [
      ...(product.standSize ? [{ '@type': 'PropertyValue', name: 'Stand Size', value: product.standSize }] : []),
      ...(product.panelSize ? [{ '@type': 'PropertyValue', name: 'Panel Size', value: product.panelSize }] : []),
      ...(product.panelThickness ? [{ '@type': 'PropertyValue', name: 'Panel Thickness', value: product.panelThickness }] : []),
      ...(product.packageSize ? [{ '@type': 'PropertyValue', name: 'Package Size', value: product.packageSize }] : []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
