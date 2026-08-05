import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed script for Qianfan Website.
 * Creates: 7 Series, 55 SKUs, Admin user, Regions, FAQs, Testimonials, Banners, ContentPages.
 */
async function main() {
  console.log('🌱 Starting seed...');

  // === 1. Admin User ===
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tsianfan.com' },
    update: {},
    create: {
      email: 'admin@tsianfan.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // === 2. Regions ===
  const regions = [
    { code: 'global', name: 'Global', phone: '+86-750-1234567', email: 'sales@tsianfan.com', timezone: 'UTC+8', isDefault: true },
    { code: 'north-america', name: 'North America', phone: '+1-888-555-0123', email: 'us-sales@tsianfan.com', timezone: 'UTC-5', isDefault: false },
    { code: 'europe', name: 'Europe', phone: '+44-20-7946-0958', email: 'eu-sales@tsianfan.com', timezone: 'UTC+1', isDefault: false },
    { code: 'asia', name: 'Asia Pacific', phone: '+86-750-1234567', email: 'asia-sales@tsianfan.com', timezone: 'UTC+8', isDefault: false },
  ];
  for (const r of regions) {
    await prisma.region.upsert({
      where: { code: r.code },
      update: {},
      create: r,
    });
  }
  console.log(`✅ ${regions.length} regions created`);

  // === 3. Series ===
  const seriesData = [
    { name: 'Wall Sliding Rack', nameCn: '推拉架', slug: 'wall-sliding-rack', prefix: 'CT', description: 'Wall-mounted sliding display racks for large format tiles 800mm+. Adjustable panel configuration, suitable for 10-15mm thickness.', sortOrder: 1 },
    { name: 'Drawer Cabinet', nameCn: '抽屉柜', slug: 'drawer-cabinet', prefix: 'CC', description: 'Drawer-style sample cabinets for wood flooring, small tiles, and stone samples. Ideal for 12-15mm thickness.', sortOrder: 2 },
    { name: 'Combination Frame', nameCn: '组合架', slug: 'combination-frame', prefix: 'CH', description: 'Modular combination display wall system for showroom main walls. Freely combinable configurations.', sortOrder: 3 },
    { name: 'Page-turning Stand', nameCn: '翻页架', slug: 'page-turning-stand', prefix: 'CF', description: 'Flip-page display stands similar to music stands. Suitable for medium format tiles with batch display capability.', sortOrder: 4 },
    { name: 'Reclining Frame', nameCn: '斜躺架', slug: 'reclining-frame', prefix: 'CX', description: 'Large format tile reclining display frames simulating installation effects. CX2019/CX006 support ultra-thin 7-9.5mm panels.', sortOrder: 5 },
    { name: 'Simple Frame', nameCn: '简易架', slug: 'simple-frame', prefix: 'CE', description: 'Single-piece sample display stands for showroom entrances or zone displays. Compact and versatile.', sortOrder: 6 },
    { name: 'Floor-standing Rack', nameCn: '落地架', slug: 'floor-standing-rack', prefix: 'CL', description: 'Freestanding movable floor display racks for 20mm thick samples. Double-sided punched display.', sortOrder: 7 },
  ];
  for (const s of seriesData) {
    await prisma.series.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }
  console.log(`✅ ${seriesData.length} series created`);

  // === 4. Products (55 SKUs) ===
  type ProductSeed = {
    sku: string;
    seriesSlug: string;
    name: string;
    description?: string;
    standSize: string;
    panelSize: string;
    panelThickness: string;
    packageSize: string;
    numberOfPanel?: number;
    features: string;
    isFeatured?: boolean;
  };

  const products: ProductSeed[] = [
    // Series 1: Wall Sliding Rack (CT + SG601) - 14 SKUs
    { sku: 'SG601', seriesSlug: 'wall-sliding-rack', name: 'SG601 Dual-Size Full-Adjustable Sliding Rack', description: 'Dual-size sliding rack with fully adjustable panels supporting 18 combination modes.', standSize: '4800×750×2550 / 7200×750×2550', panelSize: '600×2400', panelThickness: '15mm', packageSize: '2600×800×800 / 2600×800×1400', features: 'Dual size, fully adjustable panels (18 combinations)', isFeatured: true },
    { sku: 'CT011', seriesSlug: 'wall-sliding-rack', name: 'CT011 Multi-Panel Sliding Rack', description: 'Configurable 2-9 panel sliding rack for standard large format tiles.', standSize: '1250×1500×2700', panelSize: '1200×2400', panelThickness: '15mm', packageSize: '2750×1550×950', numberOfPanel: 9, features: '2~9 panels freely configurable', isFeatured: true },
    { sku: 'CT923', seriesSlug: 'wall-sliding-rack', name: 'CT923 Compact Sliding Rack', description: 'Small sliding rack for 600×1200 tiles.', standSize: '850×710×1350', panelSize: '600×1200', panelThickness: '15mm', packageSize: '1380×880×900', features: 'Small sliding rack' },
    { sku: 'CT2143', seriesSlug: 'wall-sliding-rack', name: 'CT2143 Sliding Rack Variant', description: 'CT011 size family with structural adjustments.', standSize: '1250×1500×2700', panelSize: '1200×2400', panelThickness: '15mm', packageSize: '2750×1550×950', features: 'CT011 same size family, structural adjustment' },
    { sku: 'CT914', seriesSlug: 'wall-sliding-rack', name: 'CT914 Square Tile Sliding Rack', description: 'Sliding rack specialized for square format tiles.', standSize: '1900×1250×2700', panelSize: '600×600', panelThickness: '12mm', packageSize: '700×720×150', features: 'Square tile specialized' },
    { sku: 'CT2151', seriesSlug: 'wall-sliding-rack', name: 'CT2151 Long-Edge Display Rack', description: 'Large format long-edge display sliding rack.', standSize: '2450×1250×2700', panelSize: '1200×2400', panelThickness: '15mm', packageSize: '2750×750×1150', features: 'Large panel long-edge display' },
    { sku: 'CT2119', seriesSlug: 'wall-sliding-rack', name: 'CT2119 Ultra-Wide Wall Rack', description: 'Ultra-wide wall sliding rack for extra-wide displays.', standSize: '2750×750×2600', panelSize: '1200×2400', panelThickness: '15mm', packageSize: '2600×1250×740', features: 'Ultra-wide wall' },
    { sku: 'CT635', seriesSlug: 'wall-sliding-rack', name: 'CT635 Compact Square Rack', description: 'Compact sliding rack for small square tiles.', standSize: '700×650×1400', panelSize: '600×600', panelThickness: '12mm', packageSize: '1450×710×550', features: 'Compact, small square panels' },
    { sku: 'CT2169', seriesSlug: 'wall-sliding-rack', name: 'CT2169 Long Strip Tile Rack', description: 'Sliding rack for long strip format tiles.', standSize: '2400×710×1900', panelSize: '600×1800', panelThickness: '15mm', packageSize: '2450×750×420', features: 'Long strip tiles' },
    { sku: 'CT608', seriesSlug: 'wall-sliding-rack', name: 'CT608 Sliding Rack', description: 'CT923 size family compact sliding rack.', standSize: '850×710×1350', panelSize: '600×1200', panelThickness: '15mm', packageSize: '1380×880×900', features: 'CT923 same size family' },
    { sku: 'CT605', seriesSlug: 'wall-sliding-rack', name: 'CT605 Sliding Rack', description: 'CT011 specification family sliding rack.', standSize: '1250×1500×2700', panelSize: '1200×2400', panelThickness: '15mm', packageSize: '2750×1550×950', features: 'CT011 specification family' },
    { sku: 'CT925', seriesSlug: 'wall-sliding-rack', name: 'CT925 Ultra-Compact Rack', description: 'Ultra-compact sliding rack with minimal packaging volume.', standSize: '613×600×1350', panelSize: '600×1200', panelThickness: '12mm', packageSize: '880×200×380', features: 'Ultra-compact, smallest packaging volume' },
    { sku: 'CT602', seriesSlug: 'wall-sliding-rack', name: 'CT602 Multi-Size Tile Rack', description: 'Sliding rack supporting 800×800, 1000×1000, and 1200×1200 tiles.', standSize: '1510×580×1354', panelSize: '800×800 / 1000×1000 / 1200×1200', panelThickness: '15mm', packageSize: '1380×880×900', features: 'Supports 800×800 / 1000×1000 / 1200×1200' },
    { sku: 'CT611', seriesSlug: 'wall-sliding-rack', name: 'CT611 Thin Panel Sliding Rack', description: 'Sliding rack adapted for thin 10mm panels.', standSize: '992×606×1520', panelSize: '600×1200', panelThickness: '10mm', packageSize: '1040×650×1660', features: 'Thin panel compatible (10mm)' },

    // Series 2: Drawer Cabinet (CC) - 11 SKUs
    { sku: 'CC155', seriesSlug: 'drawer-cabinet', name: 'CC155 Large Capacity Drawer Cabinet', description: 'Large capacity drawer cabinet for wood flooring and small tiles.', standSize: '2400×650×2100', panelSize: '500×500', panelThickness: '12mm', packageSize: '2500×2150×900', features: 'Large capacity, wood flooring/small tiles universal', isFeatured: true },
    { sku: 'CC2006', seriesSlug: 'drawer-cabinet', name: 'CC2006 Low Profile Drawer Cabinet', description: 'Low profile drawer cabinet for under-counter placement.', standSize: '2400×650×650', panelSize: '600×600', panelThickness: '12mm', packageSize: '2450×650×750', features: 'Low profile, under-counter placement' },
    { sku: 'CC2075', seriesSlug: 'drawer-cabinet', name: 'CC2075 Multi-Drawer Cabinet', description: 'Medium cabinet with multi-compartment drawers.', standSize: '2480×850×800', panelSize: '600×1200', panelThickness: '12mm', packageSize: '2550×900×1050', features: 'Medium cabinet, multi-compartment drawers' },
    { sku: 'CC2040', seriesSlug: 'drawer-cabinet', name: 'CC2040 Compact Drawer Cabinet', description: 'Compact drawer cabinet for 600×800 tiles.', standSize: '2300×700×750', panelSize: '600×800', panelThickness: '12mm', packageSize: '2350×750×900', features: 'Compact type' },
    { sku: 'CC918', seriesSlug: 'drawer-cabinet', name: 'CC918 Tall Slim Drawer Cabinet', description: 'Tall slim cabinet with 7 drawer size combinations.', standSize: '1065×560×2260', panelSize: '300×600', panelThickness: '12mm', packageSize: '1250×690×550', features: 'Tall slim, 7 drawer size combinations', isFeatured: true },
    { sku: 'CC608', seriesSlug: 'drawer-cabinet', name: 'CC608 Large Panel Drawer Cabinet', description: 'Large panel compatible cabinet with drawer storage.', standSize: '2550×750×2600', panelSize: '1200×2400', panelThickness: '15mm', packageSize: '2600×1250×740', features: 'Large panel compatible + drawers' },
    { sku: 'CC902', seriesSlug: 'drawer-cabinet', name: 'CC902 Medium Single Cabinet', description: 'Medium single drawer cabinet for 600×1200 tiles.', standSize: '1250×650×800', panelSize: '600×1200', panelThickness: '15mm', packageSize: '1300×700×950', features: 'Medium single cabinet' },
    { sku: 'CC010', seriesSlug: 'drawer-cabinet', name: 'CC010 Drawer Cabinet', description: 'CC902 size family drawer cabinet.', standSize: '1250×650×800', panelSize: '600×1200', panelThickness: '15mm', packageSize: '1300×700×950', features: 'CC902 same size family' },
    { sku: 'CC012', seriesSlug: 'drawer-cabinet', name: 'CC012 Rounded Corner Cabinet', description: 'Rounded corner compact drawer cabinet.', standSize: '1454×628×900', panelSize: '560×1360', panelThickness: '12mm', packageSize: '1520×740×980', features: 'Rounded corner compact cabinet' },
    { sku: 'CC2064', seriesSlug: 'drawer-cabinet', name: 'CC2064 Custom Size Cabinet', description: 'Drawer cabinet with fully customizable sample sizes.', standSize: '850×580×870', panelSize: 'Custom', panelThickness: '*', packageSize: '900×630×920', features: 'Sample size fully customizable' },
    { sku: 'CC2061', seriesSlug: 'drawer-cabinet', name: 'CC2061 Custom Size Cabinet', description: 'Drawer cabinet with fully customizable sample sizes.', standSize: '850×590×840', panelSize: 'Custom', panelThickness: '*', packageSize: '900×630×920', features: 'Sample size fully customizable' },

    // Series 3: Combination Frame (CH) - 6 SKUs
    { sku: 'CH905', seriesSlug: 'combination-frame', name: 'CH905 Small Tile Combination Frame', description: 'Combination frame for small tile display.', standSize: '2400×650×800', panelSize: '600×600', panelThickness: '12mm', packageSize: '1290×1400×840', features: 'Small tile combination display', isFeatured: true },
    { sku: 'CH8053', seriesSlug: 'combination-frame', name: 'CH8053 Combination Frame', description: 'Combination frame with 750mm panel packaging.', standSize: '1500×700×800', panelSize: '600×1200', panelThickness: '750mm', packageSize: '1550×750×950', features: 'Package includes 750mm panel' },
    { sku: 'CH2110', seriesSlug: 'combination-frame', name: 'CH2110 Combination Frame', description: 'CH905 size family combination frame.', standSize: '2400×650×800', panelSize: '600×600', panelThickness: '12mm', packageSize: '2450×690×950', features: 'CH905 same size family' },
    { sku: 'CH2039', seriesSlug: 'combination-frame', name: 'CH2039 Large Wall Combination Frame', description: 'Large wall combination frame system.', standSize: '2400×700×800', panelSize: '—', panelThickness: '15mm', packageSize: '2450×750×950', features: 'Large wall combination' },
    { sku: 'CH2111', seriesSlug: 'combination-frame', name: 'CH2111 Compact Combination Frame', description: 'CH905 compact version combination frame.', standSize: '850×590×840', panelSize: '600×600', panelThickness: '12mm', packageSize: '1290×1400×840', features: 'CH905 compact version' },
    { sku: 'CH959', seriesSlug: 'combination-frame', name: 'CH959 Multi-Size Combination Frame', description: 'Combination frame supporting 300×600, 600×600, and 600×1200 tiles.', standSize: '1500×700×800', panelSize: '300×600 / 600×600 / 600×1200', panelThickness: '750mm', packageSize: '1550×750×950', features: 'Supports 300×600 / 600×600 / 600×1200', isFeatured: true },

    // Series 4: Page-turning Stand (CF) - 8 SKUs
    { sku: 'CF005', seriesSlug: 'page-turning-stand', name: 'CF005 Medium Panel Flip Stand', description: 'Flip-page display stand for medium format tiles.', standSize: '1500×500×1850', panelSize: '600×1200', panelThickness: '12mm', packageSize: '1750×510×620', features: 'Medium panel flip', isFeatured: true },
    { sku: 'CF2025', seriesSlug: 'page-turning-stand', name: 'CF2025 Ultra-Large Panel Flip Stand', description: 'Ultra-large panel flip stand for 3200mm tiles.', standSize: '3210×2860×1738', panelSize: '1200×3200', panelThickness: '15mm', packageSize: '3250×2040×950', features: 'Ultra-large panel 3200mm', isFeatured: true },
    { sku: 'CF008', seriesSlug: 'page-turning-stand', name: 'CF008 Long Strip Flip Stand', description: 'Flip stand for long strip format tiles.', standSize: '1750×650×2100', panelSize: '600×1800', panelThickness: '15mm', packageSize: '1900×660×850', features: 'Long strip tile flip' },
    { sku: 'CF085', seriesSlug: 'page-turning-stand', name: 'CF085 Square Panel Flip Stand', description: 'Flip stand for square format tiles.', standSize: '1800×650×2100', panelSize: '600×600', panelThickness: '15mm', packageSize: '1900×660×850', features: 'Square panel flip' },
    { sku: 'CF098', seriesSlug: 'page-turning-stand', name: 'CF098 Small Panel Flip Stand', description: 'Flip stand for small format tiles.', standSize: '1500×500×1850', panelSize: '600×600', panelThickness: '12mm', packageSize: '1750×510×620', features: 'Small panel flip' },
    { sku: 'CF113', seriesSlug: 'page-turning-stand', name: 'CF113 Double-Sided Flip Stand', description: 'Double-sided flip display stand.', standSize: '900×900×2400', panelSize: '600×600', panelThickness: '12mm', packageSize: '2450×950×350', features: 'Double-sided flip' },
    { sku: 'CF009', seriesSlug: 'page-turning-stand', name: 'CF009 Flip Stand', description: 'CF008 size family flip stand.', standSize: '1800×650×2100', panelSize: '600×1800', panelThickness: '15mm', packageSize: '1900×660×850', features: 'CF008 same size family' },
    { sku: 'CF013', seriesSlug: 'page-turning-stand', name: 'CF013 Ultra-Thin Pack Flip Stand', description: 'Flip stand with ultra-thin 160mm packaging.', standSize: '1500×500×1600', panelSize: '600×1200', panelThickness: '12mm', packageSize: '1540×520×160', features: 'Ultra-thin packaging (160mm)' },

    // Series 5: Reclining Frame (CX) - 4 SKUs
    { sku: 'CX2019', seriesSlug: 'reclining-frame', name: 'CX2019 Ultra-Thin Panel Reclining Frame', description: 'Reclining frame specialized for ultra-thin 7-9.5mm panels.', standSize: '1320×1374×1947', panelSize: '600×1200', panelThickness: '7~9.5mm', packageSize: '1840×1350×480', features: 'Ultra-thin panel specialized', isFeatured: true },
    { sku: 'CX2037', seriesSlug: 'reclining-frame', name: 'CX2037 Standard Reclining Frame', description: 'Standard large panel reclining display frame.', standSize: '2100×1380×1500', panelSize: '600×1200', panelThickness: '15mm', packageSize: '1450×1380×680', features: 'Standard large panel reclining' },
    { sku: 'CX2021', seriesSlug: 'reclining-frame', name: 'CX2021 Tall Reclining Frame', description: 'CX2037 tall version reclining frame.', standSize: '2100×1380×1900', panelSize: '600×1200', panelThickness: '15mm', packageSize: '1850×1380×680', features: 'CX2037 tall version' },
    { sku: 'CX006', seriesSlug: 'reclining-frame', name: 'CX006 Large Format Ultra-Thin Reclining Frame', description: 'Large format reclining frame for ultra-thin panels.', standSize: '2520×1374×1947', panelSize: '1200×1200', panelThickness: '7~9.5mm', packageSize: '1320×1250×1100', features: 'Large format + ultra-thin panel', isFeatured: true },

    // Series 6: Simple Frame (CE) - 10 SKUs
    { sku: 'CE014', seriesSlug: 'simple-frame', name: 'CE014 Mini Sample Stand', description: 'Mini sample display stand for 200×200 tiles.', standSize: '450×400×650', panelSize: '200×200', panelThickness: '10mm', packageSize: '680×460×430', features: 'Mini sample' },
    { sku: 'CE089', seriesSlug: 'simple-frame', name: 'CE089 Small Square Panel Stand', description: 'Small square panel single display stand.', standSize: '620×450×600', panelSize: '600×600', panelThickness: '12mm', packageSize: '630×470×630', features: 'Small square panel single display' },
    { sku: 'CE984', seriesSlug: 'simple-frame', name: 'CE984 Simple Frame', description: 'CE089 same structure simple frame.', standSize: '620×450×600', panelSize: '600×600', panelThickness: '12mm', packageSize: '630×470×630', features: 'CE089 same structure' },
    { sku: 'CE965', seriesSlug: 'simple-frame', name: 'CE965 Desktop Display Stand', description: 'Desktop-level display stand at 36mm height.', standSize: '450×650×36', panelSize: '600×600', panelThickness: '15mm', packageSize: '680×460×70', features: 'Desktop level (36mm)' },
    { sku: 'CE916', seriesSlug: 'simple-frame', name: 'CE916 Minimal Sample Stand', description: 'Smallest SKU in the catalog.', standSize: '180×450×80', panelSize: '200×300', panelThickness: '12mm', packageSize: '480×190×110', features: 'Smallest SKU' },
    { sku: 'CE2126', seriesSlug: 'simple-frame', name: 'CE2126 Long Strip Sample Stand', description: 'Long strip sample display stand.', standSize: '400×800×520', panelSize: '450×600', panelThickness: '15mm', packageSize: '820×510×120', features: 'Long strip sample display' },
    { sku: 'CE2127', seriesSlug: 'simple-frame', name: 'CE2127 Tall Simple Frame', description: 'Tall version simple frame stand.', standSize: '400×800×1200', panelSize: '600×700', panelThickness: '15mm', packageSize: '810×620×120', features: 'Tall simple frame' },
    { sku: 'CE2138', seriesSlug: 'simple-frame', name: 'CE2138 Flat-Pack Square Stand', description: 'Large square panel stand with ultra-flat 50mm packaging.', standSize: '900×800×900', panelSize: '600×600', panelThickness: '12mm', packageSize: '910×810×50', features: 'Large square panel, ultra-flat packaging (50mm)' },
    { sku: 'CE2139', seriesSlug: 'simple-frame', name: 'CE2139 Flat-Pack Square Stand', description: 'CE2138 size family flat-pack stand.', standSize: '900×800×900', panelSize: '600×600', panelThickness: '12mm', packageSize: '910×810×50', features: 'CE2138 same size family' },
    { sku: 'CE095', seriesSlug: 'simple-frame', name: 'CE095 Desktop Display Stand', description: 'Desktop-level display stand, pairs with CE965.', standSize: '950×650×36', panelSize: '600×600', panelThickness: '12mm', packageSize: '980×660×70', features: 'Desktop level (pairs with CE965)' },

    // Series 7: Floor-standing Rack (CL) - 2 SKUs
    { sku: 'CL210', seriesSlug: 'floor-standing-rack', name: 'CL210 Floor-standing Display Rack', description: 'Floor-standing rack for 20mm thick samples with double-sided display.', standSize: '1200×750×2100', panelSize: '600×600', panelThickness: '20mm', packageSize: '2250×1250×180', features: '20mm thick samples, double-sided punched', isFeatured: true },
    { sku: 'CL213', seriesSlug: 'floor-standing-rack', name: 'CL213 Tall Floor-standing Rack', description: 'CL210 tall version floor-standing rack.', standSize: '1200×600×2400', panelSize: '600×600', panelThickness: '20mm', packageSize: '2450×1250×220', features: 'CL210 tall version' },
  ];

  let productCount = 0;
  for (const p of products) {
    const series = await prisma.series.findUnique({ where: { slug: p.seriesSlug } });
    if (!series) {
      console.warn(`Series not found for slug: ${p.seriesSlug}`);
      continue;
    }
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        seriesId: series.id,
        name: p.name,
        description: p.description || null,
        standSize: p.standSize,
        panelSize: p.panelSize,
        panelThickness: p.panelThickness,
        packageSize: p.packageSize,
        numberOfPanel: p.numberOfPanel || null,
        features: p.features,
        material: 'Aluminum alloy + steel + MDF',
        isFeatured: p.isFeatured || false,
        isPublished: true,
        sortOrder: productCount + 1,
      },
    });
    productCount++;
  }
  console.log(`✅ ${productCount} products created`);

  // === 5. FAQs ===
  const faqs = [
    { category: 'Product', question: 'What tile sizes are compatible with Qianfan display racks?', answer: 'Our display racks support tile sizes ranging from 200×200mm to 1200×3200mm. Use our Spec Finder tool to match your tile dimensions with compatible display racks.', keywords: 'tile size, compatibility, dimension, spec', sortOrder: 1 },
    { category: 'Product', question: 'What tile thicknesses do your racks support?', answer: 'We support thicknesses from 7mm ultra-thin panels to 20mm thick slabs. The CX2019 and CX006 models are specifically designed for ultra-thin 7-9.5mm panels, while CL210 and CL213 accommodate 20mm thick samples.', keywords: 'thickness, thin panel, thick, mm', sortOrder: 2 },
    { category: 'Product', question: 'How many SKUs do you offer?', answer: 'We offer 55 SKUs across 7 product series, covering wall sliding racks, drawer cabinets, combination frames, page-turning stands, reclining frames, simple frames, and floor-standing racks.', keywords: 'sku, model, count, how many', sortOrder: 3 },
    { category: 'Ordering', question: 'What is the minimum order quantity (MOQ)?', answer: 'The MOQ varies by product. Please submit an inquiry through our contact form or WhatsApp, and our sales team will provide detailed MOQ and pricing information within 24 hours.', keywords: 'moq, minimum order, quantity', sortOrder: 1 },
    { category: 'Ordering', question: 'Can I customize the display rack dimensions?', answer: 'Yes, models like CC2064 and CC2061 offer fully customizable sample sizes. Contact our sales team with your specific requirements for custom solutions.', keywords: 'customize, custom, dimension, size', sortOrder: 2 },
    { category: 'Shipping', question: 'What are the packaging dimensions for shipping?', answer: 'Each product has specific packaging dimensions listed on its product page. Packaging ranges from ultra-flat (50mm thick) to standard sizes. Our team can help optimize container loading.', keywords: 'packaging, shipping, container, freight', sortOrder: 1 },
    { category: 'Shipping', question: 'Do you ship internationally?', answer: 'Yes, we export to over 6 countries across North America, Europe, and Asia. We can arrange FOB, CIF, or DDP shipping terms based on your preference.', keywords: 'shipping, international, export, country', sortOrder: 2 },
    { category: 'Company', question: 'How long has Qianfan been in business?', answer: 'Qianfan has 16 years of experience manufacturing tile display racks. We export 80% of our products to Europe and America, serving tile brands, distributors, and showroom designers worldwide.', keywords: 'experience, history, years, company', sortOrder: 1 },
    { category: 'Company', question: 'Where is Qianfan located?', answer: 'Qianfan is headquartered in China with a modern manufacturing facility. We serve global clients through our regional sales offices covering North America, Europe, and Asia Pacific.', keywords: 'location, address, where, factory', sortOrder: 2 },
  ];
  for (const f of faqs) {
    await prisma.fAQ.create({ data: f });
  }
  console.log(`✅ ${faqs.length} FAQs created`);

  // === 6. Testimonials ===
  const testimonials = [
    { customerName: 'Michael Rodriguez', company: 'Stone & Tile Co.', country: 'United States', rating: 5, content: 'Qianfan\'s SG601 sliding rack transformed our showroom. The adjustable panels let us switch displays effortlessly, and the build quality is exceptional.', sortOrder: 1 },
    { customerName: 'Sophie Laurent', company: 'Maison du Carrelage', country: 'France', rating: 5, content: 'We ordered the CC918 tall cabinet for our boutique tile store. The 7-drawer configuration is perfect for organizing our small format samples. Highly recommended!', sortOrder: 2 },
    { customerName: 'Hans Müller', company: 'Fliesen Gallery GmbH', country: 'Germany', rating: 5, content: 'The CF2025 ultra-large flip stand handles our 3200mm slabs beautifully. Shipping was efficient and the flat-pack design saved us significant freight costs.', sortOrder: 3 },
    { customerName: 'David Chen', company: 'Pacific Tile Distributors', country: 'Canada', rating: 5, content: 'Excellent product quality and professional service. The CX2019 reclining frame perfectly displays our ultra-thin panels. Will order again.', sortOrder: 4 },
    { customerName: 'Giulia Rossi', company: 'Ceramica Italia Showroom', country: 'Italy', rating: 5, content: 'The combination frame system gave our showroom a modern, flexible look. The modular design allows us to reconfigure displays as needed. Fantastic product!', sortOrder: 5 },
  ];
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`✅ ${testimonials.length} testimonials created`);

  // === 7. Banners ===
  const banners = [
    { title: 'Premium Tile Display Solutions', subtitle: '16 years of craftsmanship. 55 SKUs across 7 series. Trusted by brands worldwide.', image: '/images/banners/hero-1.jpg', link: '/products', sortOrder: 1 },
    { title: 'Spec Finder Tool', subtitle: 'Enter your tile dimensions and find the perfect display rack in seconds.', image: '/images/banners/hero-2.jpg', link: '/spec-finder', sortOrder: 2 },
    { title: 'Global Export Expertise', subtitle: '80% export to Europe and America. 6 countries covered. Reliable worldwide shipping.', image: '/images/banners/hero-3.jpg', link: '/about', sortOrder: 3 },
  ];
  for (const b of banners) {
    await prisma.banner.create({ data: b });
  }
  console.log(`✅ ${banners.length} banners created`);

  // === 8. Content Pages ===
  const contentPages = [
    {
      slug: 'about',
      title: 'About Us',
      content: '<h1>About Qianfan</h1><p>Founded with a vision to revolutionize tile display solutions, Qianfan has grown over 16 years into a leading manufacturer of premium tile display racks. With 55 SKUs across 7 product series, we serve tile brands, distributors, and showroom designers in over 6 countries worldwide.</p><p>Our commitment to quality craftsmanship, innovative design, and customer satisfaction has earned us the trust of leading tile companies across North America, Europe, and Asia. 80% of our products are exported, meeting the demanding standards of international markets.</p><h2>Our Mission</h2><p>To provide the world\'s best tile display solutions that help our clients showcase their products beautifully and efficiently.</p><h2>Our Values</h2><ul><li>Quality first - every product meets international standards</li><li>Innovation driven - continuous improvement in design and manufacturing</li><li>Customer focused - tailored solutions for every client\'s needs</li><li>Global perspective - understanding diverse market requirements</li></ul>',
      metaTitle: 'About Qianfan - 16 Years of Tile Display Excellence',
      metaDescription: 'Learn about Qianfan, a leading manufacturer of premium tile display racks with 16 years of experience, serving clients in over 6 countries worldwide.',
    },
    {
      slug: 'contact',
      title: 'Contact Us',
      content: '<h1>Get in Touch</h1><p>Ready to elevate your tile showroom? Contact our team for product inquiries, custom solutions, or partnership opportunities.</p><h2>Headquarters</h2><p>Qianfan Display Solutions<br>Foshan, Guangdong, China<br>Phone: +86-750-1234567<br>Email: sales@tsianfan.com</p><h2>Regional Offices</h2><p><strong>North America:</strong> +1-888-555-0123 | us-sales@tsianfan.com</p><p><strong>Europe:</strong> +44-20-7946-0958 | eu-sales@tsianfan.com</p><p><strong>Asia Pacific:</strong> +86-750-1234567 | asia-sales@tsianfan.com</p><h2>Business Hours</h2><p>Monday - Friday: 9:00 AM - 6:00 PM (UTC+8)</p>',
      metaTitle: 'Contact Qianfan - Tile Display Solutions',
      metaDescription: 'Contact Qianfan for tile display rack inquiries, custom solutions, and partnership opportunities. Regional offices in North America, Europe, and Asia.',
    },
  ];
  for (const c of contentPages) {
    await prisma.contentPage.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log(`✅ ${contentPages.length} content pages created`);

  // === 9. Sample Projects ===
  const projects = [
    { title: 'Premium Tile Showroom - Munich', slug: 'premium-tile-showroom-munich', description: 'Complete showroom display solution for a leading German tile distributor.', content: 'Qianfan supplied a comprehensive display system featuring SG601 sliding racks and CC918 drawer cabinets for a 500sqm showroom in Munich. The project included 25 display units across 4 product series, creating an immersive customer experience.', location: 'Munich, Germany', projectDate: new Date('2025-03-15'), images: '[]', sortOrder: 1 },
    { title: 'Boutique Tile Store - Milan', slug: 'boutique-tile-store-milan', description: 'Elegant display solution for an Italian boutique tile retailer.', content: 'A custom display solution featuring CX2019 reclining frames and CH959 combination frames for a premium boutique tile store in Milan. The project emphasized ultra-thin panel display capabilities.', location: 'Milan, Italy', projectDate: new Date('2025-01-20'), images: '[]', sortOrder: 2 },
    { title: 'Large Format Slab Gallery - Toronto', slug: 'large-format-slab-gallery-toronto', description: 'Ultra-large panel display installation for a Canadian slab gallery.', content: 'Installation of CF2025 ultra-large flip stands and CT011 sliding racks for a specialized large format slab gallery in Toronto. The 3200mm panel display capability was a key requirement.', location: 'Toronto, Canada', projectDate: new Date('2024-11-10'), images: '[]', sortOrder: 3 },
  ];
  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log(`✅ ${projects.length} projects created`);

  console.log('🎉 Seed completed successfully!');
  console.log(`   Admin login: admin@tsianfan.com / admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
