/**
 * Minimal type declaration for the `jimp` package.
 *
 * jimp is a pure JavaScript image processing library used as a fallback
 * for sharp (which requires C++ compilation). This declaration allows
 * TypeScript to compile without errors. At runtime, the dynamic import
 * `await import('jimp')` will succeed if jimp is installed.
 */
declare module 'jimp' {
  interface JimpImage {
    bitmap: { width: number; height: number; data: Buffer };
    composite(src: JimpImage, x: number, y: number): JimpImage;
    resize(w: number, h: number | string): JimpImage;
    opacity(f: number): JimpImage;
    print(font: unknown, x: number, y: number, text: string): JimpImage;
    getBufferAsync(mime: string): Promise<Buffer>;
    getMIME(): string;
  }

  interface JimpConstructor {
    read(buffer: Buffer): Promise<JimpImage>;
    loadFont(font: string): Promise<unknown>;
    measureText(font: unknown, text: string): number;
    measureTextHeight(font: unknown, text: string, maxWidth: number): number;
    new (width: number, height: number, color: number): JimpImage;
    FONT_SANS_64_WHITE: string;
    AUTO: string;
  }

  const Jimp: JimpConstructor;
  export default Jimp;
}
