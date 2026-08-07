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
      { label: 'Tile Displays Rack', href: '/products/tile-displays-rack' },
      { label: 'Stone Displays Rack', href: '/products/stone-displays-rack' },
      { label: 'Wooden Flooring Display Rack', href: '/products/wooden-flooring-display-rack' },
      { label: 'Door and Window Display Racks', href: '/products/door-and-window-display-racks' },
      { label: 'Samples Box Books Display', href: '/products/samples-box-books-display' },
      { label: 'MDF Board Displays', href: '/products/mdf-board-displays' },
      { label: 'Carpet Display Rack', href: '/products/carpet-display-rack' },
      { label: 'Bathroom Displays', href: '/products/bathroom-displays' },
      { label: 'Mosaic Display Rack', href: '/products/mosaic-display-rack' },
      { label: 'Painting Sample Display Rack', href: '/products/painting-sample-display-rack' },
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
    { label: 'Tile Displays Rack', href: '/products/tile-displays-rack' },
    { label: 'Stone Displays Rack', href: '/products/stone-displays-rack' },
    { label: 'Wooden Flooring Display Rack', href: '/products/wooden-flooring-display-rack' },
    { label: 'Door and Window Display Racks', href: '/products/door-and-window-display-racks' },
    { label: 'Samples Box Books Display', href: '/products/samples-box-books-display' },
    { label: 'MDF Board Displays', href: '/products/mdf-board-displays' },
    { label: 'Carpet Display Rack', href: '/products/carpet-display-rack' },
    { label: 'Bathroom Displays', href: '/products/bathroom-displays' },
    { label: 'Mosaic Display Rack', href: '/products/mosaic-display-rack' },
    { label: 'Painting Sample Display Rack', href: '/products/painting-sample-display-rack' },
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
