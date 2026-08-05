'use client';

import { useRegionStore } from '@/stores/regionStore';

/**
 * Hook for accessing and managing the user's region.
 */
export function useRegion() {
  const { region, setRegion, isSelectorOpen, toggleSelector } = useRegionStore();

  return {
    region,
    setRegion,
    isSelectorOpen,
    toggleSelector,
  };
}
