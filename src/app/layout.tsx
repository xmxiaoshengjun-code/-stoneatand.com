import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { Toaster } from '@/components/ui/sonner';
import { isLocale } from '@/lib/i18n/config';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tsianfan.com'),
  title: {
    default: 'TSIANFAN - Premium Tile Display Racks & Showroom Solutions',
    template: '%s | TSIANFAN',
  },
  description:
    'TSIANFAN is a professional manufacturer of display stands for tile, stone, wood flooring, mosaic and carpet. 172 SKUs across 17 series, 18+ years of experience, serving 80+ countries worldwide.',
  keywords: [
    'tile display rack',
    'tile showroom display',
    'stone display rack',
    'tile display stand',
    'ceramic tile display',
    'slab display rack',
    'flooring display rack',
    'tile sample display',
    'wood flooring display rack',
    'mosaic display stand',
    'carpet display rack',
    'bathroom tile display',
    'door display stand',
    'tile sample cabinet',
    'tile sample box',
    'painting sample display',
    'MDF board display',
    'tile wall panel display',
    'display rack manufacturer',
    'TSIANFAN',
    'OEM display stand',
  ],
  authors: [{ name: 'Tsianfan (Xiamen) Industry & Trade Co., Ltd.' }],
  openGraph: {
    title: 'TSIANFAN - Tile, Stone & Flooring Display Racks',
    description:
      'TSIANFAN manufactures tile, stone and flooring display stands — 172 SKUs across 17 series, 18+ years of experience, 80% exported worldwide.',
    url: 'https://www.tsianfan.com',
    siteName: 'TSIANFAN',
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TSIANFAN - Premium Display Rack Manufacturer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TSIANFAN - Premium Tile Display Racks',
    description: 'Leading manufacturer of premium tile display racks.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const localeHeader = headersList.get('x-locale') || 'en';
  const lang = isLocale(localeHeader) ? localeHeader : 'en';

  return (
    <html lang={lang} className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
