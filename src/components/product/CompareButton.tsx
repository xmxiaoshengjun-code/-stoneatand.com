'use client';

import { memo } from 'react';
import { Check, Plus } from 'lucide-react';
import { useCompareStore } from '@/stores/compareStore';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';

/**
 * Per-card compare toggle button.
 *
 * Uses fine-grained Zustand selectors so that each button only re-renders
 * when its own SKU's membership in the compare list changes — not when
 * every other card's compare state changes.
 *
 * Previously, this used the `useCompare()` hook which subscribes to the
 * entire store (including `skus` array and `isOpen`), causing all 12+
 * CompareButton instances to re-render on any compare state change.
 *
 * @param sku - The product SKU this button represents.
 */
function CompareButtonComponent({ sku }: { sku: string }) {
  // Actions are stable function references from the store — never change.
  const { addProduct, removeProduct } = useCompareStore(
    useShallow((s) => ({
      addProduct: s.addProduct,
      removeProduct: s.removeProduct,
    })),
  );

  // Primitive boolean: only re-renders when THIS sku's membership changes.
  const inCompare = useCompareStore((s) => s.skus.includes(sku));

  // Primitive boolean: only re-renders when capacity threshold is crossed.
  const isFull = useCompareStore((s) => s.skus.length >= 4);

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
        !inCompare && isFull && 'cursor-not-allowed opacity-40',
      )}
      title={inCompare ? 'Remove from compare' : 'Add to compare'}
    >
      {inCompare ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
    </button>
  );
}

export const CompareButton = memo(CompareButtonComponent);
