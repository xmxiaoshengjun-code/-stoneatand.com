'use client';

import Link from 'next/link';
import { X, GitCompare } from 'lucide-react';
import { useCompare } from '@/hooks/useCompare';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CompareBar() {
  const { skus, removeProduct, clearProducts, isOpen } = useCompare();

  if (!isOpen || skus.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white shadow-lg">
      <div className="container-custom flex items-center justify-between gap-4 py-3">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          <GitCompare className="h-5 w-5 shrink-0 text-brand-400" />
          <span className="shrink-0 text-sm font-medium">
            Compare ({skus.length}/4):
          </span>
          {skus.map((sku) => (
            <div
              key={sku}
              className="flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-sm"
            >
              <span className="font-mono">{sku}</span>
              <button
                onClick={() => removeProduct(sku)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild size="sm" variant="brand" disabled={skus.length < 2}>
            <Link href={`/compare?skus=${skus.join(',')}`}>
              Compare Now
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={clearProducts}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
