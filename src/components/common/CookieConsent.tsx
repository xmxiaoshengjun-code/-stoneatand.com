'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-lg">
      <div className="container-custom flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-gray-600">
          We use cookies to improve your experience. By continuing to browse, you agree to our use of cookies.{' '}
          <Link href="/privacy" className="text-brand-400 hover:underline">
            Learn more
          </Link>
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" variant="brand" onClick={handleAccept}>
            Accept
          </Button>
          <button onClick={handleDecline} className="ml-2 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
