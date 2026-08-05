#!/usr/bin/env python3
"""
Batch import remaining 4 categories from chndisplay.net:
- Carpet Display Rack (12 products)
- Mosaic Display Rack (12 products)
- Bathroom Displays (12 products)
- Painting Sample Display Rack (11 products)
Total: 47 products
"""
import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')
NOW = datetime.now(timezone.utc).isoformat()

# Category descriptions
CARPET_DESC = "Professional carpet display rack designed to showcase carpet samples in showroom and retail environments. Features durable construction with adjustable panels for optimal presentation."
MOSAIC_DESC = "Mosaic display rack for showcasing mosaic tile samples. Built with sturdy materials to organize and present mosaic collections effectively."
BATHROOM_DESC = "Bathroom display stand for presenting bathroom tile and fixture samples. Compact and versatile design suitable for showroom environments."
PAINTING_DESC = "Painting sample display rack for organizing and presenting paint and coating samples. Features page-turning or rotating mechanisms for easy browsing."

CARPET_FEATURES = '["Adjustable panels","Durable steel frame","Easy assembly","Compact design"]'
MOSAIC_FEATURES = '["Modular design","Sturdy construction","Easy sample browsing","Space-efficient"]'
BATHROOM_FEATURES = '["Compact footprint","Moisture-resistant finish","Adjustable shelves","Easy mobility"]'
PAINTING_FEATURES = '["Page-turning mechanism","Rotating display","Large capacity","Smooth operation"]'

# (sku, name, series_slug, description, material, features, chndisplay_url)
PRODUCTS = [
    # === Carpet Display Rack ===
    ("DL028", "New Style Decorative Carpet Display Stand", "carpet-display-rack", CARPET_DESC, "Steel + MDF", CARPET_FEATURES, "https://chndisplay.net/product/dl028/"),
    ("DL022", "New Design Carpet Showroom Display", "carpet-display-rack", CARPET_DESC, "Steel + MDF", CARPET_FEATURES, "https://chndisplay.net/product/dl022/"),
    ("DL007", "Superior Steel Carpet Stand", "carpet-display-rack", CARPET_DESC, "Steel", CARPET_FEATURES, "https://chndisplay.net/product/dl007/"),
    ("DR903", "Skillfully Made Carpet Display", "carpet-display-rack", CARPET_DESC, "Steel + Wood", CARPET_FEATURES, "https://chndisplay.net/product/dr903/"),
    ("DR902", "Exquisite Bamboo Carpet Stand", "carpet-display-rack", CARPET_DESC, "Bamboo + Steel", CARPET_FEATURES, "https://chndisplay.net/product/dr902/"),
    ("DR901", "Strong Aluminum Carpet Rack", "carpet-display-rack", CARPET_DESC, "Aluminum", CARPET_FEATURES, "https://chndisplay.net/product/dr901/"),
    ("DL020", "Well-Finished Carpet Stand", "carpet-display-rack", CARPET_DESC, "Steel + MDF", CARPET_FEATURES, "https://chndisplay.net/product/dl020/"),
    ("DL002", "Precision-Built Carpet Display", "carpet-display-rack", CARPET_DESC, "Steel", CARPET_FEATURES, "https://chndisplay.net/product/dl002/"),
    ("DL001", "Expert-Crafted Carpet Rack", "carpet-display-rack", CARPET_DESC, "Steel + Wood", CARPET_FEATURES, "https://chndisplay.net/product/dl001/"),
    ("DF919", "High-Grade Fabric Carpet Stand", "carpet-display-rack", CARPET_DESC, "Fabric + Steel", CARPET_FEATURES, "https://chndisplay.net/product/df919/"),
    ("DF917", "Handmade Carpet Display Rack", "carpet-display-rack", CARPET_DESC, "Wood + Fabric", CARPET_FEATURES, "https://chndisplay.net/product/df917/"),
    ("DF103", "Durable Plastic Carpet Stand", "carpet-display-rack", CARPET_DESC, "Plastic", CARPET_FEATURES, "https://chndisplay.net/product/df103/"),

    # === Mosaic Display Rack ===
    ("MT001-3", "Plain and Natural Mosaic Display Rack", "mosaic-display-rack", MOSAIC_DESC, "Steel + MDF", MOSAIC_FEATURES, "https://chndisplay.net/product/__trashed-92/"),
    ("MJ002-1", "Simple and Generous Mosaic Display Rack", "mosaic-display-rack", MOSAIC_DESC, "Steel + MDF", MOSAIC_FEATURES, "https://chndisplay.net/product/__trashed-91/"),
    ("MM062", "Highly Adaptable Mosaic Display Rack", "mosaic-display-rack", MOSAIC_DESC, "Steel", MOSAIC_FEATURES, "https://chndisplay.net/product/highly-adaptable-mosaic-display-rack-mm062/"),
    ("TM046-1", "Exquisitely Structured Mosaic Display Rack", "mosaic-display-rack", MOSAIC_DESC, "Steel + Aluminum", MOSAIC_FEATURES, "https://chndisplay.net/product/exquisitely-structured-mosaic-display-rack-tm046-1/"),
    ("TM046-2", "Stain-Resistant Easy-to-Maintain Mosaic Display Rack", "mosaic-display-rack", MOSAIC_DESC, "Steel + Aluminum", MOSAIC_FEATURES, "https://chndisplay.net/product/stain-resistant-and-easy-to-maintain-mosaic-display-rack-tm046-2/"),
    ("MSK002-3", "Daily Durable Mosaic Display Rack", "mosaic-display-rack", MOSAIC_DESC, "Steel", MOSAIC_FEATURES, "https://chndisplay.net/product/daily-durable-mosaic-display-rack-msk002-3/"),
    ("MSK002-5", "Conveniently Installable Mosaic Display Rack", "mosaic-display-rack", MOSAIC_DESC, "Steel", MOSAIC_FEATURES, "https://chndisplay.net/product/conveniently-installable-mosaic-display-rack-msk002-5/"),
    ("MSK002-4", "Simple Mosaic Display Rack MSK002-4", "mosaic-display-rack", MOSAIC_DESC, "Steel", MOSAIC_FEATURES, "https://chndisplay.net/product/simple-and-generous-mosaic-display-rack-msk002-4/"),
    ("MSK001-3", "Adaptable Mosaic Display Rack MSK001-3", "mosaic-display-rack", MOSAIC_DESC, "Steel", MOSAIC_FEATURES, "https://chndisplay.net/product/highly-adaptable-mosaic-display-rack-msk001-3/"),
    ("MJ002-4", "Classic-Shaped Mosaic Display Rack", "mosaic-display-rack", MOSAIC_DESC, "Steel + MDF", MOSAIC_FEATURES, "https://chndisplay.net/product/classic-shaped-mosaic-display-rack-mj002-4/"),
    ("MT001-12", "Lightweight and Stable Mosaic Display Rack", "mosaic-display-rack", MOSAIC_DESC, "Aluminum + MDF", MOSAIC_FEATURES, "https://chndisplay.net/product/lightweight-and-stable-mosaic-display-rack-mt001-12/"),
    ("MT001-13", "Easy-to-Clean Mosaic Display Rack", "mosaic-display-rack", MOSAIC_DESC, "Aluminum + MDF", MOSAIC_FEATURES, "https://chndisplay.net/product/easy-to-clean-mosaic-display-rack-mt001-13/"),

    # === Bathroom Displays ===
    ("VS063", "Minimalist Bath Stand Setup", "bathroom-display", BATHROOM_DESC, "Steel", BATHROOM_FEATURES, "https://chndisplay.net/product/vs063-2/"),
    ("VX021", "Ceramic Tile Floor Display Stand Rack", "bathroom-display", BATHROOM_DESC, "Steel + MDF", BATHROOM_FEATURES, "https://chndisplay.net/product/vx021/"),
    ("VY005", "Bathroom Ceramic Tile Floor Display Rack", "bathroom-display", BATHROOM_DESC, "Steel", BATHROOM_FEATURES, "https://chndisplay.net/product/vy005-2/"),
    ("VX011", "Showroom Bath Stand Setup", "bathroom-display", BATHROOM_DESC, "Steel + Glass", BATHROOM_FEATURES, "https://chndisplay.net/product/vx011/"),
    ("VX010", "Stackable Bath Display Stand", "bathroom-display", BATHROOM_DESC, "Steel", BATHROOM_FEATURES, "https://chndisplay.net/product/vx010/"),
    ("VT001", "Sliding Shelf Bath Stand", "bathroom-display", BATHROOM_DESC, "Steel + MDF", BATHROOM_FEATURES, "https://chndisplay.net/product/vt001/"),
    ("VS183", "Exhibition Hall Bath Stand", "bathroom-display", BATHROOM_DESC, "Steel", BATHROOM_FEATURES, "https://chndisplay.net/product/vs183/"),
    ("VS185", "Telescoping Bath Display Stand", "bathroom-display", BATHROOM_DESC, "Steel + Aluminum", BATHROOM_FEATURES, "https://chndisplay.net/product/vs185/"),
    ("VH002", "Versatile Bath Display Stand", "bathroom-display", BATHROOM_DESC, "Steel", BATHROOM_FEATURES, "https://chndisplay.net/product/vh002/"),
    ("VH001", "Lighted Bath Display Stand", "bathroom-display", BATHROOM_DESC, "Steel + LED", BATHROOM_FEATURES, "https://chndisplay.net/product/vh001/"),
    ("VD101", "Sleek Look Bath Display Stand", "bathroom-display", BATHROOM_DESC, "Steel + Glass", BATHROOM_FEATURES, "https://chndisplay.net/product/vd101/"),
    ("VZ012", "Classic Look Bath Display", "bathroom-display", BATHROOM_DESC, "Steel + Wood", BATHROOM_FEATURES, "https://chndisplay.net/product/vz012/"),

    # === Painting Sample Display Rack ===
    ("FYJ04-1", "Mosaic Sample Panel Units Turn Page Rack", "painting-sample-display", PAINTING_DESC, "Steel + MDF", PAINTING_FEATURES, "https://chndisplay.net/product/mosaic-sample-panel-units-turn-page-rack-tiles-fyj04-1/"),
    ("FYF002-1", "Tile Floor Display Stand with Page Flipping Function", "painting-sample-display", PAINTING_DESC, "Steel + MDF", PAINTING_FEATURES, "https://chndisplay.net/product/tile-floor-display-stand-with-page-flipping-function-fyf002-1/"),
    ("FYF001-2", "Granite Stone Turning Stations Marble Tile Display", "painting-sample-display", PAINTING_DESC, "Steel + MDF", PAINTING_FEATURES, "https://chndisplay.net/product/granite-stone-turning-stations-marble-tile-display-fyf001-2/"),
    ("FYF005-2", "Custom Turn Page Showroom for Hardwood Cabinet Flooring", "painting-sample-display", PAINTING_DESC, "Steel + MDF", PAINTING_FEATURES, "https://chndisplay.net/product/custom-turn-page-showroom-for-hardwood-cabinet-flooring-fyf005-2/"),
    ("FYF001-4", "Marble Page Flip Stone Stand Flip Tile Display", "painting-sample-display", PAINTING_DESC, "Steel + MDF", PAINTING_FEATURES, "https://chndisplay.net/product/marble-page-flip-stone-stand-flip-tile-display-tile-display-fyf001-4/"),
    ("FYF001-14", "Large Rotating Stone Display Stand", "painting-sample-display", PAINTING_DESC, "Steel + MDF", PAINTING_FEATURES, "https://chndisplay.net/product/large-rotating-stone-display-stand-that-turns-on-its-side-fyf001-14/"),
    ("FYF004-4", "Large Rotating Stone Display Stand with Page Turning Function", "painting-sample-display", PAINTING_DESC, "Steel + MDF", PAINTING_FEATURES, "https://chndisplay.net/product/large-rotating-stone-display-stand-with-page-turning-function-fyf004-4/"),
    ("YH001-1", "Rust-Proof Metal Painting Display Rack", "painting-sample-display", PAINTING_DESC, "Steel", PAINTING_FEATURES, "https://chndisplay.net/product/rust-proof-metal-painting-display-rack-yh001-1/"),
    ("YH001-2", "Mobile Painting Display Rack with Locking Wheels", "painting-sample-display", PAINTING_DESC, "Steel + Wheels", PAINTING_FEATURES, "https://chndisplay.net/product/mobile-painting-display-rack-with-locking-wheels-yh001-2/"),
    ("TM047-3", "Stackable Painting Display Rack for Efficient Storage", "painting-sample-display", PAINTING_DESC, "Steel", PAINTING_FEATURES, "https://chndisplay.net/product/stackable-painting-display-rack-for-efficient-storage-tm047-3-2/"),
    ("TM047-1", "Multi-Tiered Painting Display Rack for Diverse Collections", "painting-sample-display", PAINTING_DESC, "Steel + MDF", PAINTING_FEATURES, "https://chndisplay.net/product/multi-tiered-painting-display-rack-for-diverse-collections-tm047-1/"),
]


def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # 1. Create Carpet Display Rack series if not exists
    c.execute("SELECT id FROM Series WHERE slug = 'carpet-display-rack'")
    if not c.fetchone():
        c.execute('''INSERT INTO Series (name, nameCn, slug, prefix, description, sortOrder, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                  ('Carpet Display Rack', '地毯展示架', 'carpet-display-rack', 'CP',
                   'Professional carpet display racks for showroom and retail environments.', 17, NOW, NOW))
        print("Created series: Carpet Display Rack (prefix CP)")
    else:
        print("Series 'carpet-display-rack' already exists")

    # Build series slug -> id map
    c.execute("SELECT id, slug FROM Series")
    series_map = {slug: sid for sid, slug in c.fetchall()}

    # Get max sortOrder from products
    c.execute("SELECT MAX(sortOrder) FROM Product")
    max_sort = c.fetchone()[0] or 0

    # Get existing SKUs to avoid duplicates
    c.execute("SELECT sku FROM Product")
    existing_skus = {row[0] for row in c.fetchall()}

    imported = 0
    skipped = 0
    for i, (sku, name, series_slug, desc, material, features, url) in enumerate(PRODUCTS):
        if sku in existing_skus:
            print(f"  SKIP (exists): {sku}")
            skipped += 1
            continue

        series_id = series_map.get(series_slug)
        if not series_id:
            print(f"  ERROR: series '{series_slug}' not found for {sku}")
            continue

        sort_order = max_sort + i + 1
        image_path = f"/images/products/{sku.lower()}.jpg"

        c.execute('''INSERT INTO Product
                     (sku, seriesId, name, description, material, features,
                      isFeatured, isPublished, sortOrder, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (sku, series_id, name, desc, material, features,
                   0, 1, sort_order, NOW, NOW))

        product_id = c.lastrowid

        c.execute('''INSERT INTO ProductImage
                     (productId, url, alt, sortOrder, isPrimary)
                     VALUES (?, ?, ?, ?, ?)''',
                  (product_id, image_path, name, 0, 1))

        imported += 1
        print(f"  INSERT: {sku} -> {name} (series: {series_slug})")

    conn.commit()

    # Summary
    c.execute("SELECT COUNT(*) FROM Product")
    total = c.fetchone()[0]
    c.execute("SELECT s.prefix, s.name, COUNT(p.id) as cnt FROM Series s LEFT JOIN Product p ON p.seriesId = s.id GROUP BY s.id ORDER BY s.sortOrder")
    series_counts = c.fetchall()

    print(f"\n{'='*60}")
    print(f"Imported: {imported}, Skipped: {skipped}")
    print(f"Total products in DB: {total}")
    print(f"\nSeries breakdown:")
    for prefix, name, cnt in series_counts:
        print(f"  {prefix:6s} | {name:40s} | {cnt} products")

    conn.close()


if __name__ == '__main__':
    main()
