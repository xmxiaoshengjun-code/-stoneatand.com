import { headers } from 'next/headers';

export interface RegionInfo {
  code: string;
  name: string;
  phone: string;
  email: string;
  timezone: string;
  isDefault: boolean;
}

const DEFAULT_REGION: RegionInfo = {
  code: 'global',
  name: 'Global',
  phone: '+86 13365904989',
  email: 'web@tsianfan.com',
  timezone: 'UTC+8',
  isDefault: true,
};

/**
 * Region Detector - determines visitor region based on IP country headers.
 * Works with Cloudflare (CF-IPCountry) and Vercel (X-Vercel-IP-Country) headers.
 */
export class RegionDetector {
  /**
   * Detects the visitor's region from request headers (server-side).
   */
  detectFromHeaders(): string {
    const headersList = headers();
    const countryCode =
      headersList.get('CF-IPCountry') ||
      headersList.get('X-Vercel-IP-Country') ||
      headersList.get('X-Forwarded-Country') ||
      '';

    return this.mapCountryToRegion(countryCode);
  }

  /**
   * Maps an ISO country code to a region identifier.
   */
  mapCountryToRegion(countryCode: string): string {
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

  /**
   * Returns the default region info.
   */
  getDefaultRegion(): RegionInfo {
    return DEFAULT_REGION;
  }
}

export const regionDetector = new RegionDetector();
