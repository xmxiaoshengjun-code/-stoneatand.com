'use client';

import { useEffect, useState } from 'react';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { CopyProtection } from '@/components/common/CopyProtection';

/**
 * Wrapper that defers mounting of non-critical client widgets until the
 * browser is idle (or a 3-second timeout fires, whichever comes first).
 *
 * ChatWidget and CopyProtection are not needed during initial page load
 * and their hydration competes with critical content. By deferring their
 * mount, we reduce the amount of JavaScript that must execute before the
 * page becomes interactive, improving perceived load speed.
 */
export function DeferredWidgets() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // requestIdleCallback is widely supported in modern browsers.
    // Fall back to setTimeout for older browsers.
    if (typeof window === 'undefined') return;

    const ric =
      (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback;

    if (ric) {
      const handle = ric(() => setMounted(true), { timeout: 3000 });
      return () => {
        const cic =
          (window as unknown as { cancelIdleCallback?: (handle: number) => void }).cancelIdleCallback;
        cic?.(handle);
      };
    }

    const timer = window.setTimeout(() => setMounted(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <ChatWidget />
      <CopyProtection />
    </>
  );
}
