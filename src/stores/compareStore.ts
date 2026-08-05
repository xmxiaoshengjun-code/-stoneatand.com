import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareState {
  /** List of product SKUs in the comparison list (max 4). */
  skus: string[];
  /** Adds a product SKU to the comparison list. */
  addProduct: (sku: string) => void;
  /** Removes a product SKU from the comparison list. */
  removeProduct: (sku: string) => void;
  /** Clears all products from the comparison list. */
  clearProducts: () => void;
  /** Checks if a product SKU is in the comparison list. */
  hasProduct: (sku: string) => boolean;
  /** Whether the compare bar is visible. */
  isOpen: boolean;
  /** Toggles compare bar visibility. */
  toggleOpen: () => void;
}

const MAX_COMPARE_ITEMS = 4;

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      skus: [],
      isOpen: false,
      addProduct: (sku) =>
        set((state) => {
          if (state.skus.includes(sku)) return state;
          if (state.skus.length >= MAX_COMPARE_ITEMS) {
            return state;
          }
          return { skus: [...state.skus, sku], isOpen: true };
        }),
      removeProduct: (sku) =>
        set((state) => ({
          skus: state.skus.filter((s) => s !== sku),
          isOpen: state.skus.length > 1 ? state.isOpen : false,
        })),
      clearProducts: () => set({ skus: [], isOpen: false }),
      hasProduct: (sku) => get().skus.includes(sku),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'qianfan-compare',
    }
  )
);
