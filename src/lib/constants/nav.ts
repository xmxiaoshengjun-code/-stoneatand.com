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
  { label: '仪表盘', href: '/admin/dashboard' },
  { label: '产品管理', href: '/admin/products' },
  { label: '分类管理', href: '/admin/categories' },
  { label: '询盘管理', href: '/admin/inquiries' },
  { label: '客户管理', href: '/admin/customers' },
  { label: '项目案例', href: '/admin/projects' },
  { label: '内容管理', href: '/admin/content' },
  { label: '常见问题', href: '/admin/faqs' },
  { label: '下载中心', href: '/admin/downloads' },
  { label: '友情链接', href: '/admin/friend-links' },
  { label: '重定向规则', href: '/admin/redirects' },
  { label: '媒体库', href: '/admin/media-library' },
  { label: 'B2B 铺货', href: '/admin/b2b-listings' },
  { label: '系统设置', href: '/admin/settings' },
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
