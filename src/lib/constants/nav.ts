/**
 * Navigation constants.
 */

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    href: '/products',
    children: [
      { label: 'Tile Display', href: '/products?series=tile-display' },
      { label: 'Stone Display', href: '/products?series=stone-display' },
      { label: 'Wood Flooring Display', href: '/products?series=wood-flooring-display' },
      { label: 'Sample & Cabinet', href: '/products?series=sample-cabinet' },
      { label: 'Mosaic & Decor', href: '/products?series=mosaic-decor' },
      { label: 'Other Display', href: '/products?series=other-display' },
    ],
  },
  { label: 'Spec Finder', href: '/spec-finder' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Inquiries', href: '/admin/inquiries' },
  { label: 'Customers', href: '/admin/customers' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Content', href: '/admin/content' },
  { label: 'FAQs', href: '/admin/faqs' },
  { label: 'Downloads', href: '/admin/downloads' },
  { label: 'Friend Links', href: '/admin/friend-links' },
  { label: 'Redirects', href: '/admin/redirects' },
  { label: 'Media Library', href: '/admin/media-library' },
  { label: 'B2B Listings', href: '/admin/b2b-listings' },
  { label: 'Settings', href: '/admin/settings' },
];

export const FOOTER_LINKS = {
  products: [
    { label: 'Tile Display Racks', href: '/products?series=tile-display' },
    { label: 'Stone Display Racks', href: '/products?series=stone-display' },
    { label: 'Wood Flooring Display', href: '/products?series=wood-flooring-display' },
    { label: 'Sample Cabinets', href: '/products?series=sample-cabinet' },
    { label: 'Mosaic Display', href: '/products?series=mosaic-decor' },
    { label: 'All Products', href: '/products' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Contact', href: '/contact' },
    { label: 'Spec Finder', href: '/spec-finder' },
  ],
  resources: [
    { label: 'Compare Products', href: '/compare' },
    { label: 'FAQ', href: '/faq' },
  ],
};
