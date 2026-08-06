import { productService } from './productService';
import type { SpecFinderResult, SpecFinderParams } from '@/types/product';

/**
 * Spec Finder Service - matches tile specifications to compatible display racks.
 */
export class SpecFinderService {
  /**
   * Finds products matching the given tile specifications.
   * Performs defensive validation on input parameters and logs
   * the query details and result count for debugging.
   * Delegates to ProductService for the actual matching logic.
   */
  async findMatches(params: SpecFinderParams): Promise<SpecFinderResult[]> {
    // Defensive validation — reject invalid dimensions early.
    if (!params.tileWidth || params.tileWidth <= 0) {
      console.warn('[SpecFinder] Rejected query: invalid tileWidth =', params.tileWidth);
      return [];
    }
    if (!params.tileHeight || params.tileHeight <= 0) {
      console.warn('[SpecFinder] Rejected query: invalid tileHeight =', params.tileHeight);
      return [];
    }
    if (params.tileThickness !== undefined && params.tileThickness <= 0) {
      console.warn('[SpecFinder] Rejected query: invalid tileThickness =', params.tileThickness);
      return [];
    }

    console.warn(
      '[SpecFinder] Searching with params:',
      JSON.stringify(params)
    );

    const results = await productService.findProductsBySpec(params);

    console.warn(
      `[SpecFinder] Found ${results.length} matching product(s) for ${params.tileWidth}×${params.tileHeight}mm` +
      (params.tileThickness ? ` @${params.tileThickness}mm` : '')
    );

    return results;
  }

  /**
   * Returns available thickness options for the spec finder UI.
   */
  getThicknessOptions(): Array<{ label: string; value: number }> {
    return [
      { label: '7-9.5mm (Ultra-thin)', value: 9 },
      { label: '10mm (Thin panel)', value: 10 },
      { label: '12mm (Standard thin)', value: 12 },
      { label: '15mm (Standard thick)', value: 15 },
      { label: '20mm (Thick slab)', value: 20 },
    ];
  }

  /**
   * Returns common tile size presets for the spec finder UI.
   */
  getSizePresets(): Array<{ label: string; width: number; height: number }> {
    return [
      { label: '200×200mm', width: 200, height: 200 },
      { label: '300×600mm', width: 300, height: 600 },
      { label: '500×500mm', width: 500, height: 500 },
      { label: '600×600mm', width: 600, height: 600 },
      { label: '600×1200mm', width: 600, height: 1200 },
      { label: '600×1800mm', width: 600, height: 1800 },
      { label: '600×2400mm', width: 600, height: 2400 },
      { label: '800×800mm', width: 800, height: 800 },
      { label: '1000×1000mm', width: 1000, height: 1000 },
      { label: '1200×1200mm', width: 1200, height: 1200 },
      { label: '1200×2400mm', width: 1200, height: 2400 },
      { label: '1200×3200mm', width: 1200, height: 3200 },
    ];
  }
}

export const specFinderService = new SpecFinderService();
