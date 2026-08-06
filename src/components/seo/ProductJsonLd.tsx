import { SITE_CONFIG } from '@/lib/constants/seo';
import type { Product } from '@/types/product';

interface ProductJsonLdProps {
  product: Product;
  /** Array of absolute or relative image URLs */
  images?: string[];
  /** Price range indicator, e.g. "$$", "$$$" */
  priceRange?: string;
}

/**
 * Renders Product JSON-LD structured data for SEO.
 * Includes image, offers, brand, manufacturer, and additional properties.
 */
export function ProductJsonLd({ product, images = [], priceRange }: ProductJsonLdProps) {
  // Build image list: use provided images, fallback to product images
  const imageUrls = images.length > 0
    ? images
    : (product.images || []).map(
        (img) => (img.url.startsWith('http') ? img.url : `${SITE_CONFIG.url}${img.url}`)
      );

  const offers: Record<string, unknown> = {
    '@type': 'Offer',
    priceCurrency: 'USD',
    price: '0',
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
    },
    description: 'Contact for pricing - B2B custom manufacturing',
    url: `${SITE_CONFIG.url}/en/products/${product.sku.toLowerCase()}`,
  };

  if (priceRange) {
    offers['priceRange'] = priceRange;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    description: product.description || product.features || '',
    category: product.series?.name || 'Tile Display Rack',
    image: imageUrls,
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name,
    },
    manufacturer: {
      '@type': 'Organization',
      name: SITE_CONFIG.fullName,
      url: SITE_CONFIG.url,
    },
    offers,
    additionalProperty: [
      ...(product.standSize ? [{ '@type': 'PropertyValue', name: 'Stand Size', value: product.standSize }] : []),
      ...(product.panelSize ? [{ '@type': 'PropertyValue', name: 'Panel Size', value: product.panelSize }] : []),
      ...(product.panelThickness ? [{ '@type': 'PropertyValue', name: 'Panel Thickness', value: product.panelThickness }] : []),
      ...(product.packageSize ? [{ '@type': 'PropertyValue', name: 'Package Size', value: product.packageSize }] : []),
      ...(product.material ? [{ '@type': 'PropertyValue', name: 'Material', value: product.material }] : []),
      ...(product.numberOfPanel ? [{ '@type': 'PropertyValue', name: 'Number of Panels', value: product.numberOfPanel }] : []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
