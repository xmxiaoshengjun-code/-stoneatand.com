'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      // Use requestAnimationFrame to throttle: only one state check per frame.
      // This prevents the scroll handler from firing on every pixel of scroll,
      // which can cause excessive function calls and jank on lower-end devices.
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 400);
        ticking = false;
      });
    };

    // passive: true tells the browser the handler won't call preventDefault,
    // allowing it to scroll immediately without waiting for the handler.
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-all hover:bg-gray-700',
        visible ? 'opacity-100' : 'opacity-0'
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
