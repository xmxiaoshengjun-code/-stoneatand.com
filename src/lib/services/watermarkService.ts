import { settingsService } from '@/lib/services/settingsService';

/**
 * Watermark Service - manages watermark configuration and image processing.
 * Reads watermark settings from SiteSetting (key-value store) and applies
 * watermarks using jimp (pure JS image processing library).
 *
 * Note: Originally designed for sharp, but sharp requires native C++ bindings
 * that may not compile in all environments. jimp is used as a fallback
 * (pure JavaScript, no compilation dependencies).
 */

export interface WatermarkConfig {
  enabled: boolean;
  type: 'text' | 'image';
  text: string;
  image: string;
  position: string;
  opacity: number;
  size: number;
}

/** Default watermark configuration. */
const DEFAULT_CONFIG: WatermarkConfig = {
  enabled: false,
  type: 'text',
  text: 'TSIANFAN',
  image: '',
  position: 'southeast',
  opacity: 50,
  size: 30,
};

/** Position name to Jimp placement mapping (9-grid). */
const POSITION_MAP: Record<string, { x: number; y: number }> = {
  northwest: { x: 0, y: 0 },          // 0=left, 0=top
  north: { x: -1, y: 0 },             // -1=center
  northeast: { x: -2, y: 0 },         // -2=right
  west: { x: 0, y: -1 },
  center: { x: -1, y: -1 },
  east: { x: -2, y: -1 },
  southwest: { x: 0, y: -2 },         // -2=bottom
  south: { x: -1, y: -2 },
  southeast: { x: -2, y: -2 },
};

export class WatermarkService {
  /** Retrieves the current watermark configuration from SiteSetting. */
  async getConfig(): Promise<WatermarkConfig> {
    const all = await settingsService.getAll();
    return {
      enabled: all.watermarkEnabled === 'true',
      type: (all.watermarkType as 'text' | 'image') || 'text',
      text: all.watermarkText || 'TSIANFAN',
      image: all.watermarkImage || '',
      position: all.watermarkPosition || 'southeast',
      opacity: parseInt(all.watermarkOpacity || '50', 10),
      size: parseInt(all.watermarkSize || '30', 10),
    };
  }

  /**
   * Applies a watermark to an image buffer.
   * Uses jimp for text and image watermarks.
   * If jimp is not available, returns the original buffer unchanged.
   *
   * @param buffer - The original image buffer.
   * @param config - Optional watermark config; if omitted, reads from settings.
   * @returns The watermarked image buffer (or original if watermark disabled).
   */
  async applyWatermark(
    buffer: Buffer,
    config?: WatermarkConfig
  ): Promise<Buffer> {
    const cfg = config ?? (await this.getConfig());

    if (!cfg.enabled) {
      return buffer;
    }

    try {
      // Dynamically import jimp (pure JS, no compilation needed)
      const Jimp = (await import('jimp')).default;

      const opacity = Math.max(0, Math.min(100, cfg.opacity)) / 100;
      const image = await Jimp.read(buffer);
      const imgWidth = image.bitmap.width;
      const imgHeight = image.bitmap.height;

      if (cfg.type === 'text' && cfg.text) {
        // Create text watermark using Jimp
        const fontSize = Math.max(12, Math.round(imgWidth * (cfg.size / 100) / 5));
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);

        // Create a transparent overlay for the text
        const textImage = new Jimp(imgWidth, imgHeight, 0x00000000);
        const textWidth = Jimp.measureText(font, cfg.text);
        const textHeight = Jimp.measureTextHeight(font, cfg.text, textWidth);

        // Calculate position based on 9-grid
        const pos = POSITION_MAP[cfg.position] || POSITION_MAP.southeast;
        let x: number;
        let y: number;

        if (pos.x === 0) x = 20;
        else if (pos.x === -1) x = (imgWidth - textWidth) / 2;
        else x = imgWidth - textWidth - 20;

        if (pos.y === 0) y = 20;
        else if (pos.y === -1) y = (imgHeight - textHeight) / 2;
        else y = imgHeight - textHeight - 20;

        textImage.print(font, x, y, cfg.text);
        textImage.opacity(opacity);

        image.composite(textImage, 0, 0);
      } else if (cfg.type === 'image' && cfg.image) {
        // Read watermark image from filesystem
        const path = await import('path');
        const fs = await import('fs/promises');

        const watermarkPath = path.join(process.cwd(), 'public', cfg.image);
        let watermarkBuffer: Buffer;
        try {
          watermarkBuffer = await fs.readFile(watermarkPath);
        } catch {
          // Watermark image file not found, return original
          return buffer;
        }

        const watermarkImage = await Jimp.read(watermarkBuffer);
        const wmWidth = Math.round(imgWidth * (cfg.size / 100));
        watermarkImage.resize(wmWidth, Jimp.AUTO);
        watermarkImage.opacity(opacity);

        // Calculate position
        const pos = POSITION_MAP[cfg.position] || POSITION_MAP.southeast;
        const wmWidthActual = watermarkImage.bitmap.width;
        const wmHeight = watermarkImage.bitmap.height;

        let x: number;
        let y: number;

        if (pos.x === 0) x = 20;
        else if (pos.x === -1) x = (imgWidth - wmWidthActual) / 2;
        else x = imgWidth - wmWidthActual - 20;

        if (pos.y === 0) y = 20;
        else if (pos.y === -1) y = (imgHeight - wmHeight) / 2;
        else y = imgHeight - wmHeight - 20;

        image.composite(watermarkImage, x, y);
      }

      return await image.getBufferAsync(image.getMIME());
    } catch (error) {
      console.error('WatermarkService: image processing failed, returning original:', error);
      // If jimp fails for any reason, return the original buffer
      return buffer;
    }
  }
}

export const watermarkService = new WatermarkService();
