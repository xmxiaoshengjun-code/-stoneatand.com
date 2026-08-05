'use client';

import { useCallback } from 'react';

/**
 * Hook for tracking visitor behavior events.
 * Sends events to the tracking API endpoint.
 */
export function useTracking() {
  const track = useCallback(
    async (eventType: string, data?: Record<string, unknown>) => {
      try {
        await fetch('/api/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType, ...data }),
        });
      } catch {
        // Silently fail - tracking is non-critical
      }
    },
    []
  );

  return {
    trackPageView: (pageUrl: string) => track('page_view', { pageUrl }),
    trackProductView: (productId: number, productSku: string) =>
      track('product_view', { productId, searchData: productSku }),
    trackInquirySubmit: (inquiryNo: string) =>
      track('inquiry_submit', { searchData: inquiryNo }),
    trackChatStart: () => track('chat_start'),
    trackSearch: (keyword: string) => track('search', { searchData: keyword }),
    trackSpecFinder: (tileWidth: number, tileHeight: number, tileThickness?: number) =>
      track('spec_finder', { searchData: `${tileWidth}x${tileHeight}x${tileThickness || 'any'}` }),
  };
}
