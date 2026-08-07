'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { specFinderService } from '@/lib/services/specFinderService';
import { useTracking } from '@/hooks/useTracking';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { localizePath } from '@/lib/i18n/config';
import { buildProductDetailPath } from '@/lib/constants/series';
import type { SpecFinderResult } from '@/types/product';

export function SpecFinderClient() {
  const router = useRouter();
  const { trackSpecFinder } = useTracking();
  const { locale } = useI18n();
  const lh = (href: string) => localizePath(href, locale);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SpecFinderResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [thickness, setThickness] = useState('');

  const presets = specFinderService.getSizePresets();
  const thicknessOptions = specFinderService.getThicknessOptions();

  const handlePresetSelect = (preset: string) => {
    const match = presets.find((p) => p.label === preset);
    if (match) {
      setWidth(String(match.width));
      setHeight(String(match.height));
      setSelectedPreset(preset);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = Number(width);
    const h = Number(height);
    if (!w || !h) return;

    setLoading(true);
    setHasSearched(true);
    setError(null);
    trackSpecFinder(w, h, Number(thickness) || undefined);

    try {
      const res = await fetch('/api/products/spec-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tileWidth: w,
          tileHeight: h,
          tileThickness: thickness ? Number(thickness) : undefined,
        }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setResults(data.data || []);
      } else {
        setResults([]);
        setError(data.message || 'Search failed. Please try again.');
      }
    } catch (err) {
      setResults([]);
      setError('Unable to reach the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search form */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Tile Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Presets */}
            <div>
              <Label className="mb-2 block">Quick Select Common Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePresetSelect(p.label)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      selectedPreset === p.label
                        ? 'border-brand-400 bg-brand-50 text-brand-600'
                        : 'border-gray-300 text-gray-700 hover:border-brand-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual input */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="width">Tile Width (mm) *</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g., 600"
                  required
                />
              </div>
              <div>
                <Label htmlFor="height">Tile Height (mm) *</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 1200"
                  required
                />
              </div>
              <div>
                <Label htmlFor="thickness">Thickness (mm)</Label>
                <Select value={thickness} onValueChange={setThickness}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any thickness" />
                  </SelectTrigger>
                  <SelectContent>
                    {thicknessOptions.map((t) => (
                      <SelectItem key={t.value} value={String(t.value)}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" variant="brand" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Find Matching Racks
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && !loading && (
        <div>
          {/* Error state */}
          {error && (
            <Card className="mb-4 border-red-200 bg-red-50">
              <CardContent className="py-6 text-center text-red-600">
                <p className="font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          <h3 className="mb-4 text-lg font-semibold">
            {results.length > 0
              ? `Found ${results.length} matching product(s)`
              : 'No matching products found'}
          </h3>
          {results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <p>No display racks match your specifications.</p>
                <p className="mt-2 text-sm">
                  Try adjusting your tile dimensions or thickness selection for more results.
                </p>
                <p className="mt-2 text-sm">
                  or contact us at <a href="mailto:web@tsianfan.com" className="text-brand-600 underline">web@tsianfan.com</a> for custom solutions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => (
                <Card key={result.product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge variant="brand" className="font-mono">
                        {result.product.sku}
                      </Badge>
                      <Badge variant="success">
                        {result.matchScore} match{result.matchScore > 1 ? 'es' : ''}
                      </Badge>
                    </div>
                    <h4 className="mb-2 font-semibold text-gray-900">{result.product.name}</h4>
                    <ul className="mb-4 space-y-1 text-xs text-gray-600">
                      {result.matchReasons.map((reason, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-green-500">✓</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={lh(buildProductDetailPath(result.product.sku, result.product.series?.slug))}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
