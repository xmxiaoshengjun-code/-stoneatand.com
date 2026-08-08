'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { useTracking } from '@/hooks/useTracking';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizePath } from '@/lib/i18n/config';
import { FileUploadZone } from './FileUploadZone';
import type { Attachment } from '@/types/attachment';

interface InquiryFormProps {
  productId?: number;
  productSku?: string;
  onSuccess?: () => void;
}

export function InquiryForm({ productId, productSku, onSuccess }: InquiryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { trackInquirySubmit } = useTracking();
  const { locale } = useI18n();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      customerName: formData.get('customerName') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || undefined,
      company: (formData.get('company') as string) || undefined,
      country: (formData.get('country') as string) || undefined,
      productId: productId || undefined,
      productSku: productSku || undefined,
      quantity: Number(formData.get('quantity')) || undefined,
      message: formData.get('message') as string,
      source: 'website',
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.code === 200 || result.code === 201) {
        // Track inquiry submission
        const inquiryNo = result.data?.inquiryNo || '';
        trackInquirySubmit(inquiryNo);

        toast.success('Inquiry submitted successfully!');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(localizePath('/inquiry/success', locale));
        }
      } else {
        toast.error(result.message || 'Failed to submit inquiry');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="customerName">Name *</Label>
          <Input id="customerName" name="customerName" required placeholder="Your full name" />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required placeholder="you@company.com" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" placeholder="+1 234 567 890" />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" placeholder="Your company name" />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" placeholder="Your country" />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" type="number" min="1" placeholder="Estimated quantity" />
        </div>
      </div>
      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Tell us about your requirements, tile specifications, or any questions..."
        />
      </div>

      <div>
        <Label>Attachments</Label>
        <FileUploadZone attachments={attachments} onChange={setAttachments} />
      </div>

      <Button type="submit" variant="brand" size="lg" disabled={loading} className="w-full">
        {loading ? (
          'Submitting...'
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Inquiry
          </>
        )}
      </Button>
    </form>
  );
}
