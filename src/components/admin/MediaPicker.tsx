'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

interface MediaItem {
  id: number;
  url: string;
  filename: string;
  alt: string | null;
  category: string;
}

/**
 * Media picker dialog component.
 * Displays the media library grid and allows selecting an image URL.
 */
export function MediaPicker({ open, onClose, onSelect, title = 'Select Image' }: MediaPickerProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useSWR(
    '/api/admin/media-library?pageSize=48',
    fetcher
  );

  const items: MediaItem[] = data?.data?.items ?? [];

  const filteredItems = search
    ? items.filter(
        (item) =>
          item.filename.toLowerCase().includes(search.toLowerCase()) ||
          (item.alt || '').toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const handleSelect = useCallback(() => {
    if (!selectedUrl) {
      toast.error('Please select an image first');
      return;
    }
    onSelect(selectedUrl);
    setSelectedUrl(null);
    onClose();
  }, [selectedUrl, onSelect, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="mb-3">
          <Input
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No images found</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedUrl(item.url)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedUrl === item.url
                      ? 'border-brand-400 ring-2 ring-brand-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.alt || item.filename}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={handleSelect} disabled={!selectedUrl}>
            Select
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
