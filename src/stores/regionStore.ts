import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RegionState {
  /** Current region code (e.g., 'global', 'north-america', 'europe', 'asia'). */
  region: string;
  /** Sets the current region. */
  setRegion: (region: string) => void;
  /** Whether the region selector is open. */
  isSelectorOpen: boolean;
  /** Toggles region selector visibility. */
  toggleSelector: () => void;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      region: 'global',
      setRegion: (region) => set({ region, isSelectorOpen: false }),
      isSelectorOpen: false,
      toggleSelector: () => set((state) => ({ isSelectorOpen: !state.isSelectorOpen })),
    }),
    {
      name: 'qianfan-region',
    }
  )
);
