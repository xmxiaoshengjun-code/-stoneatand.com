import { InquiryDetail } from '@/components/admin/InquiryDetail';

export default async function InquiryDetailPage({ params }: { params: { id: string } }) {
  const inquiryId = parseInt(params.id, 10);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">询盘详情</h1>
      <InquiryDetail inquiryId={inquiryId} />
    </div>
  );
}
