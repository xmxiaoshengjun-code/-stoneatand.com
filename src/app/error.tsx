'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Something went wrong!</h1>
        <p className="mx-auto max-w-md text-gray-600">
          An unexpected error occurred. Please try again, or contact us if the problem persists.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset} variant="brand">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
