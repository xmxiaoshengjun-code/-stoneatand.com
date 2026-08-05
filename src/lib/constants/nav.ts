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
      { label: 'Wall Sliding Rack', href: '/products?series=wall-sliding-rack' },
      { label: 'Drawer Cabinet', href: '/products?series=drawer-cabinet' },
      { label: 'Combination Frame', href: '/products?series=combination-frame' },
      { label: 'Page-turning Stand', href: '/products?series=page-turning-stand' },
      { label: 'Reclining Frame', href: '/products?series=reclining-frame' },
      { label: 'Simple Frame', href: '/products?series=simple-frame' },
      { label: 'Floor-standing Rack', href: '/products?series=floor-standing-rack' },
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
    { label: 'Wall Sliding Rack', href: '/products?series=wall-sliding-rack' },
    { label: 'Drawer Cabinet', href: '/products?series=drawer-cabinet' },
    { label: 'Combination Frame', href: '/products?series=combination-frame' },
    { label: 'Page-turning Stand', href: '/products?series=page-turning-stand' },
    { label: 'Reclining Frame', href: '/products?series=reclining-frame' },
    { label: 'Simple Frame', href: '/products?series=simple-frame' },
    { label: 'Floor-standing Rack', href: '/products?series=floor-standing-rack' },
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
