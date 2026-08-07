'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn, imgUrl } from '@/lib/utils';

interface ProjectGalleryProps {
  images: string[];
  title: string;
}

export function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

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

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, index) => (
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
      )}
    </div>
  );
}
