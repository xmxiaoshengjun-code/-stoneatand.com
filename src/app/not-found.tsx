import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="space-y-6">
        <p className="text-8xl font-bold text-brand">404</p>
        <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
        <p className="mx-auto max-w-md text-gray-600">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
