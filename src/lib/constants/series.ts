/**
 * Product series constants.
 */

export interface SeriesInfo {
  slug: string;
  name: string;
  nameCn: string;
  prefix: string;
  description: string;
  shortDescription: string;
  icon: string;
  heroImage?: string;
  parentSlug?: string;
  parentName?: string;
}

export interface ParentCategory {
  slug: string;
  name: string;
  nameCn: string;
  description: string;
  icon: string;
  heroImage?: string;
}

/**
 * Top-level parent categories matching chndisplay.net structure.
 * These are the 10 product category groups shown in navigation and homepage.
 */
export const PARENT_CATEGORIES: ParentCategory[] = [
  {
    slug: 'tile-displays-rack',
    name: 'Tile Displays Rack',
    nameCn: '瓷砖展示架',
    description: 'Display racks and stands for ceramic and porcelain tiles, including wall sliding racks, drawer cabinets, combination frames, and more.',
    icon: 'sliders',
    heroImage: '/images/products/CT011.jpg',
  },
  {
    slug: 'stone-displays-rack',
    name: 'Stone Displays Rack',
    nameCn: '石材展示架',
    description: 'Display racks designed for stone and artificial stone samples, built to support heavy stone slabs.',
    icon: 'mountain',
    heroImage: '/images/products/ld003-2.jpg',
  },
  {
    slug: 'wooden-flooring-display-rack',
    name: 'Wooden Flooring Display Rack',
    nameCn: '木地板展示架',
    description: 'Display racks for wood flooring and laminate samples, optimized for angle presentation and texture visibility.',
    icon: 'trees',
    heroImage: '/images/products/wd3073.jpg',
  },
  {
    slug: 'door-and-window-display-racks',
    name: 'Door and Window Display Racks',
    nameCn: '门窗展示架',
    description: 'Display racks for door and window products, highlighting craftsmanship, design, and material quality.',
    icon: 'door-open',
    heroImage: '/images/products/d001-3.jpg',
  },
  {
    slug: 'samples-box-books-display',
    name: 'Samples Box Books Display',
    nameCn: '样品箱册展示',
    description: 'Portable sample boxes and books for stone, tile, and material samples. Compact for client visits and trade shows.',
    icon: 'briefcase',
    heroImage: '/images/products/lgx002-3.jpg',
  },
  {
    slug: 'mdf-board-displays',
    name: 'MDF Board Displays',
    nameCn: '密度板展示',
    description: 'MDF board displays with smooth surface finish, excellent processing performance for custom display designs.',
    icon: 'rectangle-horizontal',
    heroImage: '/images/products/ps001.jpg',
  },
  {
    slug: 'carpet-display-rack',
    name: 'Carpet Display Rack',
    nameCn: '地毯展示架',
    description: 'Display racks for carpet and flooring samples, protecting samples while showcasing patterns and textures.',
    icon: 'square-stack',
    heroImage: '/images/products/df103.jpg',
  },
  {
    slug: 'bathroom-displays',
    name: 'Bathroom Displays',
    nameCn: '卫浴展示',
    description: 'Bathroom display stands for tile and fixture samples. Compact and moisture-resistant for showroom use.',
    icon: 'shower-head',
    heroImage: '/images/products/vd101.jpg',
  },
  {
    slug: 'mosaic-display-rack',
    name: 'Mosaic Display Rack',
    nameCn: '马赛克展示架',
    description: 'Display racks for mosaic tile samples with modular design and flexible arrangement options.',
    icon: 'grid-3x3',
    heroImage: '/images/products/mj002-1.jpg',
  },
  {
    slug: 'painting-sample-display-rack',
    name: 'Painting Sample Display Rack',
    nameCn: '涂料样品展示架',
    description: 'Painting sample display racks with page-turning and rotating mechanisms, large capacity for diverse collections.',
    icon: 'palette',
    heroImage: '/images/products/fyf001-14.jpg',
  },
];

export const SERIES_INFO: SeriesInfo[] = [
  {
    slug: 'wall-sliding-rack',
    name: 'Wall Sliding Rack',
    nameCn: '推拉架',
    prefix: 'CT',
    description: 'Wall-mounted sliding display racks for large format tiles 800mm+. Adjustable panel configuration, suitable for 10-15mm thickness.',
    shortDescription: 'Sliding racks for large format tiles',
    icon: 'sliders',
    heroImage: '/images/products/CT011.jpg',
    parentSlug: 'tile-displays-rack',
    parentName: 'Tile Displays Rack',
  },
  {
    slug: 'drawer-cabinet',
    name: 'Drawer Cabinet',
    nameCn: '抽屉柜',
    prefix: 'CC',
    description: 'Drawer-style sample cabinets for wood flooring, small tiles, and stone samples. Ideal for 12-15mm thickness.',
    shortDescription: 'Drawer cabinets for samples',
    icon: 'archive',
    heroImage: '/images/products/CC155.jpg',
    parentSlug: 'tile-displays-rack',
    parentName: 'Tile Displays Rack',
  },
  {
    slug: 'combination-frame',
    name: 'Combination Frame',
    nameCn: '组合架',
    prefix: 'CH',
    description: 'Modular combination display wall system for showroom main walls. Freely combinable configurations.',
    shortDescription: 'Modular display wall system',
    icon: 'layout-grid',
    heroImage: '/images/products/CH905.jpg',
    parentSlug: 'tile-displays-rack',
    parentName: 'Tile Displays Rack',
  },
  {
    slug: 'page-turning-stand',
    name: 'Page-turning Stand',
    nameCn: '翻页架',
    prefix: 'CF',
    description: 'Flip-page display stands similar to music stands. Suitable for medium format tiles with batch display capability.',
    shortDescription: 'Flip-page display stands',
    icon: 'book-open',
    heroImage: '/images/products/CF005.jpg',
    parentSlug: 'tile-displays-rack',
    parentName: 'Tile Displays Rack',
  },
  {
    slug: 'reclining-frame',
    name: 'Reclining Frame',
    nameCn: '斜躺架',
    prefix: 'CX',
    description: 'Large format tile reclining display frames simulating installation effects. Supports ultra-thin 7-9.5mm panels.',
    shortDescription: 'Reclining display frames',
    icon: 'angle-right',
    heroImage: '/images/products/CX2019.jpg',
    parentSlug: 'tile-displays-rack',
    parentName: 'Tile Displays Rack',
  },
  {
    slug: 'simple-frame',
    name: 'Simple Frame',
    nameCn: '简易架',
    prefix: 'CE',
    description: 'Single-piece sample display stands for showroom entrances or zone displays. Compact and versatile.',
    shortDescription: 'Compact sample display stands',
    icon: 'frame',
    heroImage: '/images/products/CE014.jpg',
    parentSlug: 'tile-displays-rack',
    parentName: 'Tile Displays Rack',
  },
  {
    slug: 'floor-standing-rack',
    name: 'Floor-standing Rack',
    nameCn: '落地架',
    prefix: 'CL',
    description: 'Freestanding movable floor display racks for 20mm thick samples. Double-sided punched display.',
    shortDescription: 'Freestanding floor display racks',
    icon: 'building-2',
    heroImage: '/images/products/CL210.jpg',
    parentSlug: 'tile-displays-rack',
    parentName: 'Tile Displays Rack',
  },
  {
    slug: 'stone-display-rack',
    name: 'Stone Display Rack',
    nameCn: '石材展示架',
    prefix: 'LD',
    description: 'Display racks designed for stone and artificial stone samples. Sturdy construction to support heavy stone slabs.',
    shortDescription: 'Racks for stone slab samples',
    icon: 'mountain',
    heroImage: '/images/products/ld003-2.jpg',
    parentSlug: 'stone-displays-rack',
    parentName: 'Stone Displays Rack',
  },
  {
    slug: 'wood-flooring-display-rack',
    name: 'Wood Flooring Display Rack',
    nameCn: '木地板展示架',
    prefix: 'WD',
    description: 'Display racks for wood flooring and laminate samples. Optimized angle presentation for texture visibility.',
    shortDescription: 'Wood flooring sample display',
    icon: 'trees',
    heroImage: '/images/products/wd3073.jpg',
    parentSlug: 'wooden-flooring-display-rack',
    parentName: 'Wooden Flooring Display Rack',
  },
  {
    slug: 'door-window-display-rack',
    name: 'Door & Window Display Rack',
    nameCn: '门窗展示架',
    prefix: 'DL',
    description: 'Display racks for door and window products. Highlights craftsmanship, design, and material quality.',
    shortDescription: 'Door and window display solutions',
    icon: 'door-open',
    heroImage: '/images/products/d001-3.jpg',
    parentSlug: 'door-and-window-display-racks',
    parentName: 'Door and Window Display Racks',
  },
  {
    slug: 'sample-box-book-display',
    name: 'Sample Box & Book Display',
    nameCn: '样品箱册展示',
    prefix: 'PP',
    description: 'Portable sample boxes and books for stone, tile, and material samples. Compact for client visits and trade shows.',
    shortDescription: 'Portable sample boxes and books',
    icon: 'briefcase',
    heroImage: '/images/products/lgx002-3.jpg',
    parentSlug: 'samples-box-books-display',
    parentName: 'Samples Box Books Display',
  },
  {
    slug: 'mdf-board-display',
    name: 'MDF Board Display',
    nameCn: '密度板展示',
    prefix: 'STB',
    description: 'MDF board displays with smooth surface finish. Excellent processing performance for custom display designs.',
    shortDescription: 'MDF board display solutions',
    icon: 'rectangle-horizontal',
    heroImage: '/images/products/ps001.jpg',
    parentSlug: 'mdf-board-displays',
    parentName: 'MDF Board Displays',
  },
  {
    slug: 'mosaic-display-rack',
    name: 'Mosaic Display Rack',
    nameCn: '马赛克展示架',
    prefix: 'LX',
    description: 'Display racks for mosaic tile samples. Modular design with flexible arrangement options.',
    shortDescription: 'Mosaic tile display solutions',
    icon: 'grid-3x3',
    heroImage: '/images/products/mj002-1.jpg',
    parentSlug: 'mosaic-display-rack',
    parentName: 'Mosaic Display Rack',
  },
  {
    slug: 'bathroom-display',
    name: 'Bathroom Display',
    nameCn: '卫浴展示',
    prefix: 'BT',
    description: 'Bathroom display stands for tile and fixture samples. Compact and moisture-resistant for showroom use.',
    shortDescription: 'Bathroom sample display stands',
    icon: 'shower-head',
    heroImage: '/images/products/vd101.jpg',
    parentSlug: 'bathroom-displays',
    parentName: 'Bathroom Displays',
  },
  {
    slug: 'painting-sample-display',
    name: 'Painting Sample Display',
    nameCn: '涂料样品展示',
    prefix: 'PT',
    description: 'Painting sample display racks with page-turning and rotating mechanisms. Large capacity for diverse collections.',
    shortDescription: 'Paint sample display racks',
    icon: 'palette',
    heroImage: '/images/products/fyf001-14.jpg',
    parentSlug: 'painting-sample-display-rack',
    parentName: 'Painting Sample Display Rack',
  },
  {
    slug: 'tile-wall-panel-display',
    name: 'Tile Wall Panel Display',
    nameCn: '瓷砖墙板展示',
    prefix: 'DDF',
    description: 'Wall panel display systems for large format tiles. Space-efficient vertical presentation.',
    shortDescription: 'Wall panel tile display systems',
    icon: 'panel-top',
    heroImage: '/images/products/ddf001-1.jpg',
    parentSlug: 'tile-displays-rack',
    parentName: 'Tile Displays Rack',
  },
  {
    slug: 'carpet-display-rack',
    name: 'Carpet Display Rack',
    nameCn: '地毯展示架',
    prefix: 'CP',
    description: 'Display racks for carpet and flooring samples. Protects samples while showcasing patterns and textures.',
    shortDescription: 'Carpet sample display racks',
    icon: 'square-stack',
    heroImage: '/images/products/df103.jpg',
    parentSlug: 'carpet-display-rack',
    parentName: 'Carpet Display Rack',
  },
];

export const SERIES_BY_SLUG = SERIES_INFO.reduce(
  (acc, s) => ({ ...acc, [s.slug]: s }),
  {} as Record<string, SeriesInfo>
);

export const SERIES_BY_PREFIX = SERIES_INFO.reduce(
  (acc, s) => ({ ...acc, [s.prefix]: s }),
  {} as Record<string, SeriesInfo>
);

export const TOTAL_SKU_COUNT = 168;
export const TOTAL_SERIES_COUNT = 17;

/** Checks whether the given slug matches one of the PARENT_CATEGORIES slugs. */
export function isParentSlug(slug: string): boolean {
  return PARENT_CATEGORIES.some((p) => p.slug === slug);
}

/** Returns the ParentCategory object for the given slug, or undefined if not found. */
export function getParentCategory(slug: string): ParentCategory | undefined {
  return PARENT_CATEGORIES.find((p) => p.slug === slug);
}

/** Returns all child SeriesInfo entries whose parentSlug matches the given parent slug. */
export function getChildSeries(parentSlug: string): SeriesInfo[] {
  return SERIES_INFO.filter((s) => s.parentSlug === parentSlug);
}

/**
 * Builds the product detail page URL path (without locale prefix).
 * Format: /products/{series-slug}/{sku}
 *
 * If `seriesSlug` is provided (e.g. from a populated `product.series` relation),
 * it is used directly. Otherwise the function falls back to looking up the
 * series by the SKU prefix (e.g. "LD018-1" → prefix "LD" → "stone-display-rack").
 * If no series can be determined, the old-style path `/products/{sku}` is
 * returned — the old route will 301-redirect to the correct new URL.
 *
 * @param sku        The product SKU (case-insensitive; will be lowercased).
 * @param seriesSlug Optional series slug from the product's series relation.
 * @returns The product detail path, e.g. "/products/stone-display-rack/ld018-1".
 */
export function buildProductDetailPath(sku: string, seriesSlug?: string): string {
  const skuLower = sku.toLowerCase();

  let resolvedSlug = seriesSlug;

  if (!resolvedSlug) {
    // Fall back to prefix-based lookup
    const upperSku = sku.toUpperCase();
    for (const info of SERIES_INFO) {
      if (upperSku.startsWith(info.prefix)) {
        resolvedSlug = info.slug;
        break;
      }
    }
  }

  if (!resolvedSlug) {
    // Last resort: old-style path (will be 301-redirected by the old route)
    return `/products/${skuLower}`;
  }

  return `/products/${resolvedSlug}/${skuLower}`;
}
