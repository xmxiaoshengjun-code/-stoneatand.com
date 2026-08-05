import { CustomerDetail } from './CustomerDetail';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id, 10);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Customer Detail</h1>
      <CustomerDetail customerId={customerId} />
    </div>
  );
}
