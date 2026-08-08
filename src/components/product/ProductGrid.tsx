import { ProductCard } from './ProductCard';
import type { Product } from '@/types/product';
import type { Locale } from '@/lib/i18n/config';

export function ProductGrid({
  products,
  locale,
}: {
  products: Product[];
  locale: Locale;
}) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-gray-500">No products found</p>
        <p className="mt-2 text-sm text-gray-400">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
