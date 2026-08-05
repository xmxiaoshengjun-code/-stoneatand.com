/**
 * Minimal type declaration for the `sharp` package.
 *
 * sharp is a native C++ addon that may not install in all environments.
 * This declaration allows TypeScript to compile without errors. At runtime,
 * the dynamic import `await import('sharp')` will fail gracefully and the
 * watermark service returns the original buffer unchanged.
 */
declare module 'sharp' {
  interface SharpMetadata {
    width?: number;
    height?: number;
    channels?: number;
    format?: string;
  }

  interface SharpCompositeOptions {
    input: Buffer;
    gravity?: string;
    blend?: string;
    tile?: boolean;
    raw?: { width: number; height: number; channels: number };
  }

  interface SharpResizeOptions {
    width?: number;
    height?: number;
  }

  interface SharpImage {
    metadata(): Promise<SharpMetadata>;
    composite(options: SharpCompositeOptions[]): SharpImage;
    resize(width?: number, height?: number, options?: SharpResizeOptions): SharpImage;
    ensureAlpha(): SharpImage;
    toBuffer(): Promise<Buffer>;
  }

  function sharp(buffer: Buffer): SharpImage;
  export default sharp;
}
