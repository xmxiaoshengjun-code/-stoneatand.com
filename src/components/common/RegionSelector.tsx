'use client';

import { Globe, Check } from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';

const REGIONS = [
  { code: 'global', name: 'Global', flag: '🌍' },
  { code: 'north-america', name: 'North America', flag: '🇺🇸' },
  { code: 'europe', name: 'Europe', flag: '🇪🇺' },
  { code: 'asia', name: 'Asia Pacific', flag: '🌏' },
];

export function RegionSelector() {
  const { region, setRegion, isSelectorOpen, toggleSelector } = useRegion();
  const current = REGIONS.find((r) => r.code === region) || REGIONS[0];

  return (
    <div className="relative">
      <button
        onClick={toggleSelector}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
      >
        <Globe className="h-4 w-4" />
        <span>{current.flag}</span>
        <span>{current.name}</span>
      </button>

      {isSelectorOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border bg-white p-2 shadow-lg">
          <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Select your region
          </p>
          {REGIONS.map((r) => (
            <button
              key={r.code}
              onClick={() => setRegion(r.code)}
              className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>{r.flag}</span>
                <span>{r.name}</span>
              </span>
              {r.code === region && <Check className="h-4 w-4 text-brand-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
