/**
 * Product-related TypeScript types.
 */

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  sku: string;
  seriesId: number;
  name: string;
  description: string | null;
  standSize: string | null;
  panelSize: string | null;
  panelThickness: string | null;
  packageSize: string | null;
  numberOfPanel: number | null;
  adjustablePanelSize: string | null;
  weight: string | null;
  material: string | null;
  features: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  series?: Series;
}

export interface Series {
  id: number;
  name: string;
  nameCn: string | null;
  slug: string;
  prefix: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilterParams {
  series?: string;
  panelSize?: string;
  panelThickness?: string;
  keyword?: string;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface SpecFinderParams {
  tileWidth: number;
  tileHeight: number;
  tileThickness?: number;
}

export interface SpecFinderResult {
  product: Product;
  matchScore: number;
  matchReasons: string[];
}
