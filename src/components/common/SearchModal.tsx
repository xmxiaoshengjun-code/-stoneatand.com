'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PARENT_CATEGORIES } from '@/lib/constants/series';

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-20">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Search Products</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              autoFocus
              type="text"
              placeholder="Search by SKU, name, or keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Browse by Category
          </p>
          <div className="flex flex-wrap gap-2">
            {PARENT_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  router.push(`/products/${cat.slug}`);
                  onClose();
                }}
                className="rounded-md border px-3 py-1.5 text-sm text-gray-700 hover:border-brand-400 hover:text-brand-400"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
