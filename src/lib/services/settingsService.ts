import { prisma } from '@/lib/prisma';

/**
 * Settings Service - manages site-wide key-value settings stored in the
 * SiteSetting table. Uses raw SQL because the Prisma client cannot be
 * regenerated in the current sandbox environment (the SiteSetting model
 * was added to schema.prisma and the table created directly in SQLite).
 */

interface SiteSettingRow {
  id: number;
  key: string;
  value: string;
}

export class SettingsService {
  /**
   * Retrieves all settings as a key-value map.
   */
  async getAll(): Promise<Record<string, string>> {
    const rows = await prisma.$queryRawUnsafe<SiteSettingRow[]>(
      'SELECT id, key, value FROM SiteSetting'
    );
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  /**
   * Retrieves a single setting value by key.
   */
  async get(key: string): Promise<string | null> {
    const rows = await prisma.$queryRawUnsafe<SiteSettingRow[]>(
      'SELECT id, key, value FROM SiteSetting WHERE key = ?',
      key
    );
    return rows.length > 0 ? rows[0].value : null;
  }

  /**
   * Sets a single setting value (upsert).
   */
  async set(key: string, value: string): Promise<void> {
    const existing = await this.get(key);
    if (existing !== null) {
      await prisma.$executeRawUnsafe(
        'UPDATE SiteSetting SET value = ? WHERE key = ?',
        value,
        key
      );
    } else {
      await prisma.$executeRawUnsafe(
        'INSERT INTO SiteSetting (key, value) VALUES (?, ?)',
        key,
        value
      );
    }
  }

  /**
   * Sets multiple settings at once (upsert each).
   */
  async setMany(settings: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key, value);
    }
  }

  /**
   * Retrieves structured site settings with defaults applied.
   */
  async getSiteSettings() {
    const all = await this.getAll();
    return {
      // Site information
      siteName: all.siteName || 'TSIANFAN',
      siteDescription: all.siteDescription || '',
      contactEmail: all.contactEmail || '',
      contactPhone: all.contactPhone || '',
      contactAddress: all.contactAddress || '',
      whatsappNumber: all.whatsappNumber || '',

      // Social media links
      linkedinUrl: all.linkedinUrl || '',
      facebookUrl: all.facebookUrl || '',
      youtubeUrl: all.youtubeUrl || '',
      instagramUrl: all.instagramUrl || '',
      xUrl: all.xUrl || '',

      // SMTP configuration
      smtpHost: all.smtpHost || '',
      smtpPort: all.smtpPort || '587',
      smtpUsername: all.smtpUsername || '',
      smtpPassword: '', // Never return password
      smtpFromEmail: all.smtpFromEmail || '',

      // AI customer service configuration
      aiProvider: all.aiProvider || 'none',
      aiApiKey: '', // Never return API key
      aiModel: all.aiModel || 'gpt-4o',
      aiSystemPrompt: all.aiSystemPrompt || '',
    };
  }

  /**
   * Updates site settings from a partial object.
   * Only non-empty values are saved; empty strings are skipped
   * (except for explicit clears via null).
   */
  async updateSiteSettings(data: Record<string, string>): Promise<void> {
    const settings: Record<string, string> = {};

    const allowedKeys = [
      'siteName', 'siteDescription', 'contactEmail', 'contactPhone',
      'contactAddress', 'whatsappNumber',
      'linkedinUrl', 'facebookUrl', 'youtubeUrl', 'instagramUrl', 'xUrl',
      'smtpHost', 'smtpPort', 'smtpUsername', 'smtpPassword', 'smtpFromEmail',
      'aiProvider', 'aiApiKey', 'aiModel', 'aiSystemPrompt',
    ];

    for (const key of allowedKeys) {
      if (key in data && data[key] !== undefined) {
        // Skip empty password/apiKey fields (don't overwrite with empty)
        if ((key === 'smtpPassword' || key === 'aiApiKey') && !data[key]) {
          continue;
        }
        settings[key] = data[key];
      }
    }

    await this.setMany(settings);
  }
}

export const settingsService = new SettingsService();
