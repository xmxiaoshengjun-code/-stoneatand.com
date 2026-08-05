import { CustomerList } from './CustomerList';

export default function AdminCustomersPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Customers</h1>
      <CustomerList />
    </div>
  );
}
