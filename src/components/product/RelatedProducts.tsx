import { ProductCard } from './ProductCard';
import { SectionTitle } from '@/components/common/SectionTitle';
import type { Product } from '@/types/product';

export function RelatedProducts({ products }: { products: Product[] }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mt-16">
      <SectionTitle
        eyebrow="You may also like"
        title="Related Products"
        align="left"
      />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
