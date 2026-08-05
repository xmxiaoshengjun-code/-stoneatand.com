'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InquiryForm } from './InquiryForm';
import { MessageSquare } from 'lucide-react';

export function InquiryButton({
  productId,
  productSku,
}: {
  productId?: number;
  productSku?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand" size="lg">
          <MessageSquare className="mr-2 h-4 w-4" />
          Request Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request a Quote</DialogTitle>
        </DialogHeader>
        {productSku && (
          <p className="text-sm text-gray-500">
            Product: <span className="font-mono font-semibold text-brand-400">{productSku}</span>
          </p>
        )}
        <InquiryForm
          productId={productId}
          productSku={productSku}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
