import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { LOCALES } from '@/lib/i18n/config';

/**
 * Generates the sitemap.xml for SEO.
 * Includes static pages, product pages, series pages, and project pages.
 * All URLs include the default locale prefix (/en) and hreflang alternates for all 5 locales.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tsianfan.com';
  const now = new Date();

  // Helper: build hreflang alternates for a given path (without locale prefix)
  function buildAlternates(path: string) {
    const languages: Record<string, string> = {};
    const suffix = path === '/' ? '' : path;
    for (const loc of LOCALES) {
      languages[loc] = `${baseUrl}/${loc}${suffix}`;
    }
    languages['x-default'] = `${baseUrl}/en${suffix}`;
    return { languages };
  }

  // Static pages — each with locale prefix and hreflang alternates
  const staticPagePaths = [
    { path: '/', priority: 1.0, freq: 'weekly' as const },
    { path: '/products', priority: 0.9, freq: 'weekly' as const },
    { path: '/spec-finder', priority: 0.8, freq: 'monthly' as const },
    { path: '/compare', priority: 0.6, freq: 'monthly' as const },
    { path: '/about', priority: 0.7, freq: 'monthly' as const },
    { path: '/contact', priority: 0.7, freq: 'monthly' as const },
    { path: '/projects', priority: 0.6, freq: 'monthly' as const },
    { path: '/faq', priority: 0.6, freq: 'monthly' as const },
  ];

  const staticPages: MetadataRoute.Sitemap = staticPagePaths.map((p) => ({
    url: `${baseUrl}/en${p.path === '/' ? '' : p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
    alternates: buildAlternates(p.path),
  }));

  // Fetch all published products
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    select: { sku: true, updatedAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.map((p) => {
    const path = `/products/${p.sku.toLowerCase()}`;
    return {
      url: `${baseUrl}/en${path}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: buildAlternates(path),
    };
  });

  // Fetch all series
  const series = await prisma.series.findMany({
    select: { slug: true, updatedAt: true },
  });

  const seriesPages: MetadataRoute.Sitemap = series.map((s) => {
    const path = `/products?series=${s.slug}`;
    return {
      url: `${baseUrl}/en${path}`,
      lastModified: s.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: buildAlternates(path),
    };
  });

  // Fetch published projects
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => {
    const path = `/projects/${p.slug}`;
    return {
      url: `${baseUrl}/en${path}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: buildAlternates(path),
    };
  });

  return [...staticPages, ...productPages, ...seriesPages, ...projectPages];
}
