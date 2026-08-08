/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self';",
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/products',
        permanent: false,
      },
      // Legacy slug 301 redirects — old series slugs → new parent category slugs
      {
        source: '/:locale/products',
        has: [{ type: 'query', key: 'series', value: 'tile-display' }],
        destination: '/:locale/products?series=tile-displays-rack',
        permanent: true,
      },
      {
        source: '/:locale/products',
        has: [{ type: 'query', key: 'series', value: 'stone-display' }],
        destination: '/:locale/products?series=stone-displays-rack',
        permanent: true,
      },
      {
        source: '/:locale/products',
        has: [{ type: 'query', key: 'series', value: 'wood-flooring-display' }],
        destination: '/:locale/products?series=wooden-flooring-display-rack',
        permanent: true,
      },
      {
        source: '/:locale/products',
        has: [{ type: 'query', key: 'series', value: 'sample-cabinet' }],
        destination: '/:locale/products?series=samples-box-books-display',
        permanent: true,
      },
      {
        source: '/:locale/products',
        has: [{ type: 'query', key: 'series', value: 'mosaic-decor' }],
        destination: '/:locale/products?series=mosaic-display-rack',
        permanent: true,
      },
      // NOTE: 'other-display' does not have a redirect rule because its target
      // is /:locale/products (no series param), and Next.js preserves the
      // original query string on redirect — that would cause an infinite loop.
      // Instead, ProductListClient and page.tsx handle 'other-display' as a
      // no-op (treat it like no series param, showing all products).
    ];
  },
};

export default nextConfig;
