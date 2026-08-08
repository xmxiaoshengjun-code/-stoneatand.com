'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/product';
import { CompareButton } from '@/components/product/CompareButton';
import { localizePath } from '@/lib/i18n/config';
import { buildProductDetailPath } from '@/lib/constants/series';
import { imgUrl } from '@/lib/utils';
import type { Locale } from '@/lib/i18n/config';

/**
 * Product card for the product listing grid.
 *
 * Memoized to prevent unnecessary re-renders when the parent
 * ProductGrid / ProductListClient re-renders due to unrelated state
 * changes (e.g., search params updates). The `product` prop is
 * compared by reference — SWR returns stable references for
 * unchanged data, so only cards whose product data actually changed
 * will re-render.
 *
 * @param product - The product data to display.
 * @param locale  - The current locale for URL building.
 */
function ProductCardComponent({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const productHref = localizePath(
    buildProductDetailPath(product.sku, product.series?.slug),
    locale,
  );
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-lg">
      <Link href={productHref} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {primaryImage ? (
            <Image
              src={imgUrl(primaryImage.url)}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl font-bold text-gray-300">
              {product.sku.slice(0, 2)}
            </div>
          )}
          {product.isFeatured && (
            <Badge variant="brand" className="absolute left-3 top-3">
              <Star className="mr-1 h-3 w-3 fill-current" />
              Featured
            </Badge>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <Badge variant="outline" className="font-mono">
            {product.sku}
          </Badge>
          <CompareButton sku={product.sku} />
        </div>
        <Link href={productHref}>
          <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 hover:text-brand-400">
            {product.name}
          </h3>
        </Link>
        <div className="space-y-1 text-xs text-gray-500">
          {product.panelSize && (
            <p>Panel: {product.panelSize}</p>
          )}
          {product.panelThickness && (
            <p>Thickness: {product.panelThickness}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardComponent);
