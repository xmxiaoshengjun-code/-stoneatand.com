'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Global analytics component.
 *
 * Automatically tracks:
 * - page_view on every route change (with referrer + UTM params)
 * - page_leave with duration (seconds spent on the page)
 * - product_view when the visitor lands on a product detail page (/products/[sku])
 *
 * Mount once in the marketing layout. Uses sendBeacon for reliable
 * unload-time reporting and falls back to fetch.
 */
export function Analytics() {
  const pathname = usePathname();
  const pageEnterTimeRef = useRef<number>(Date.now());
  const currentPageRef = useRef<string>(pathname);
  const sessionIdRef = useRef<string>('');
  const utmCapturedRef = useRef<boolean>(false);

  // --- Initialise / restore session ID ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let sid = sessionStorage.getItem('analytics_session_id');
    if (!sid) {
      sid = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
      sessionStorage.setItem('analytics_session_id', sid);
    }
    sessionIdRef.current = sid;
  }, []);

  // --- Helper: detect device type ---
  const getDeviceType = (): string => {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent;
    if (/iPad|Tablet/i.test(ua)) return 'tablet';
    if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile';
    return 'desktop';
  };

  // --- Helper: classify traffic source from referrer ---
  const getSourceCategory = (referrer: string): string => {
    if (!referrer) return 'direct';
    const searchEngines = ['google.com', 'bing.com', 'yahoo.com', 'baidu.com', 'yandex.com'];
    const socialMedia = ['facebook.com', 'twitter.com', 'x.com', 'linkedin.com', 'youtube.com', 'instagram.com', 'pinterest.com'];
    const lower = referrer.toLowerCase();
    if (searchEngines.some((s) => lower.includes(s))) return 'search';
    if (socialMedia.some((s) => lower.includes(s))) return 'social';
    return 'referral';
  };

  // --- Helper: send a tracking event ---
  const trackEvent = useRef((eventType: string, data?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    const referrer = document.referrer || '';
    const deviceType = getDeviceType();
    const sourceCategory = getSourceCategory(referrer);

    const payload = JSON.stringify({
      sessionId,
      eventType,
      pageUrl: window.location.pathname,
      country: undefined,
      referrer: referrer || undefined,
      deviceType,
      sourceCategory,
      ...data,
    });

    // Use sendBeacon during unload for reliability, otherwise fetch
    if (eventType === 'page_leave' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/tracking', blob);
    } else {
      fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silently fail - tracking is non-critical
      });
    }
  });

  // --- Capture UTM params once per session ---
  useEffect(() => {
    if (utmCapturedRef.current || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');

    if (utmSource || utmMedium || utmCampaign) {
      const referrer = document.referrer || '';
      const searchData = JSON.stringify({
        utmSource: utmSource || '',
        utmMedium: utmMedium || '',
        utmCampaign: utmCampaign || '',
        referrer,
      });
      trackEvent.current('session_start', { searchData });
    }
    utmCapturedRef.current = true;
  }, []);

  // --- Track page_view + product_view on route change ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const prevPage = currentPageRef.current;
    const prevEnterTime = pageEnterTimeRef.current;

    // Report page_leave for the previous page with its duration
    if (prevPage && prevPage !== pathname) {
      const duration = Math.round((now - prevEnterTime) / 1000);
      trackEvent.current('page_leave', {
        pageUrl: prevPage,
        duration,
      });
    }

    // Report page_view for the new page
    pageEnterTimeRef.current = now;
    currentPageRef.current = pathname;

    trackEvent.current('page_view', {
      pageUrl: pathname,
      searchData: document.referrer || undefined,
    });

    // Detect product detail page: /products/[sku]
    const productMatch = pathname.match(/^\/products\/([^/]+)$/);
    if (productMatch) {
      const sku = productMatch[1];
      trackEvent.current('product_view', {
        searchData: sku,
      });
    }
  }, [pathname]);

  // --- Track page_leave on tab close / hide ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const duration = Math.round((Date.now() - pageEnterTimeRef.current) / 1000);
        trackEvent.current('page_leave', {
          pageUrl: currentPageRef.current,
          duration,
        });
      }
    };

    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - pageEnterTimeRef.current) / 1000);
      trackEvent.current('page_leave', {
        pageUrl: currentPageRef.current,
        duration,
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // This component renders nothing - it's purely for tracking
  return null;
}
