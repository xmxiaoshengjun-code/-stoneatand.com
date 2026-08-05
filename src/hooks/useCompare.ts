'use client';

import { useCompareStore } from '@/stores/compareStore';

/**
 * Hook for managing the product comparison list via Zustand.
 */
export function useCompare() {
  const { skus, addProduct, removeProduct, clearProducts, hasProduct, isOpen, toggleOpen } =
    useCompareStore();

  return {
    skus,
    count: skus.length,
    addProduct,
    removeProduct,
    clearProducts,
    hasProduct,
    isOpen,
    toggleOpen,
    isFull: skus.length >= 4,
  };
}
