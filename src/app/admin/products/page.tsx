import { ProductTable } from '@/components/admin/ProductTable';

export default function AdminProductsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Products</h1>
      <ProductTable />
    </div>
  );
}
