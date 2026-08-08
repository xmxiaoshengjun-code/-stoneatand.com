'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { cn, imgUrl } from '@/lib/utils';

/** Number of thumbnails to show initially before the "Show more" button. */
const INITIAL_THUMBNAIL_COUNT = 10;
/** Number of additional thumbnails to load each time "Show more" is clicked. */
const THUMBNAIL_LOAD_BATCH = 10;

interface ProjectGalleryProps {
  images: string[];
  title: string;
}

export function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(INITIAL_THUMBNAIL_COUNT);

  if (!images || images.length === 0) {
    return null;
  }

  const visibleThumbnails = images.slice(0, visibleCount);
  const remainingCount = images.length - visibleCount;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={imgUrl(images[activeIndex])}
          alt={`${title} - Image ${activeIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 896px"
          priority
        />
      </div>

      {/* Thumbnails — only render a limited number initially */}
      {images.length > 1 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {visibleThumbnails.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'relative h-16 w-20 overflow-hidden rounded-lg border-2 transition-all',
                  index === activeIndex
                    ? 'border-brand-400 opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'
                )}
              >
                <Image
                  src={imgUrl(img)}
                  alt={`${title} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          {/* Show more button — loads additional thumbnails in batches */}
          {remainingCount > 0 && (
            <button
              onClick={() =>
                setVisibleCount((prev) => Math.min(prev + THUMBNAIL_LOAD_BATCH, images.length))
              }
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Show {remainingCount} more
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
