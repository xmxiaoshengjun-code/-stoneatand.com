'use client';

import { Check, Plus } from 'lucide-react';
import { useCompare } from '@/hooks/useCompare';
import { cn } from '@/lib/utils';

export function CompareButton({ sku }: { sku: string }) {
  const { hasProduct, addProduct, removeProduct, isFull } = useCompare();
  const inCompare = hasProduct(sku);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeProduct(sku);
    } else if (!isFull) {
      addProduct(sku);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full border transition-all',
        inCompare
          ? 'border-brand-400 bg-brand-400 text-white'
          : 'border-gray-300 text-gray-400 hover:border-brand-400 hover:text-brand-400',
        !inCompare && isFull && 'cursor-not-allowed opacity-40'
      )}
      title={inCompare ? 'Remove from compare' : 'Add to compare'}
    >
      {inCompare ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
    </button>
  );
}
