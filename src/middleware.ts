import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { LOCALES, DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from '@/lib/i18n/config';

/** JWT secret key for verifying admin tokens. Must be set via JWT_SECRET env var in production. */
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'DEV-ONLY-DO-NOT-USE-IN-PRODUCTION'
);

/** Cookie name storing the admin JWT token. */
const ADMIN_COOKIE = 'admin_token';

/** Cookie name storing the detected user region. */
const REGION_COOKIE = 'user_region';

/**
 * Paths that should NOT be locale-prefixed.
 */
const EXCLUDED_PREFIXES = ['/admin', '/api', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/images'];

/**
 * Detect the preferred locale from cookie or Accept-Language header.
 */
function detectLocale(request: NextRequest): string {
  // 1. Check cookie
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const acceptLang = request.headers.get('accept-language') || '';
  const accepted = acceptLang
    .split(',')
    .map((part) => {
      const [lang, q] = part.trim().split(';q=');
      return { lang: lang.toLowerCase().split('-')[0], q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of accepted) {
    if (isLocale(lang)) return lang;
  }

  // 3. Default
  return DEFAULT_LOCALE;
}

/**
 * Edge-compatible middleware for route protection, GEO detection, and locale routing.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Locale Routing ---
  const isFirstSegmentLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  const isExcluded = EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isFirstSegmentLocale && !isExcluded) {
    // Redirect to locale-prefixed URL
    const locale = detectLocale(request);
    const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url);
    const redirect = NextResponse.redirect(newUrl);
    redirect.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
    return redirect;
  }

  // Extract locale from URL for localized pages
  let currentLocale = DEFAULT_LOCALE;
  if (isFirstSegmentLocale) {
    const segLocale = pathname.split('/')[1];
    if (isLocale(segLocale)) {
      currentLocale = segLocale;
    }
  }

  // Pass locale to server components via request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', currentLocale);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Store locale in cookie when visiting a localized page
  if (isFirstSegmentLocale && isLocale(currentLocale)) {
    response.cookies.set(LOCALE_COOKIE, currentLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  // --- GEO Region Detection ---
  const existingRegion = request.cookies.get(REGION_COOKIE)?.value;
  if (!existingRegion) {
    const countryCode =
      request.headers.get('CF-IPCountry') ||
      request.headers.get('X-Vercel-IP-Country') ||
      '';
    const region = mapCountryToRegion(countryCode);
    response.cookies.set(REGION_COOKIE, region, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });
  }

  // --- Admin Route Protection ---
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (!payload.userId) {
        throw new Error('Invalid token payload');
      }
      // Add user info to headers for downstream use
      response.headers.set('x-user-id', String(payload.userId));
      response.headers.set('x-user-email', String(payload.email || ''));
      response.headers.set('x-user-role', String(payload.role || 'ADMIN'));
    } catch {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.delete(ADMIN_COOKIE);
      return redirectResponse;
    }
  }

  return response;
}

/**
 * Maps an ISO country code to a region identifier.
 * Returns 'global' as fallback for unknown or local IPs.
 */
function mapCountryToRegion(countryCode: string): string {
  const code = countryCode.toUpperCase();
  const northAmerica = ['US', 'CA', 'MX'];
  const europe = [
    'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH',
    'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'PL', 'CZ', 'GR', 'RO',
  ];
  const asia = ['CN', 'JP', 'KR', 'IN', 'ID', 'VN', 'TH', 'MY', 'PH', 'SG'];

  if (northAmerica.includes(code)) return 'north-america';
  if (europe.includes(code)) return 'europe';
  if (asia.includes(code)) return 'asia';
  return 'global';
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images).*)',
  ],
};
