import { ProductForm } from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id, 10);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">编辑产品</h1>
      <ProductForm productId={productId} />
    </div>
  );
}
