"""Fix DDF series and add missing products."""
import sqlite3
import os
import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # 1. Add Tile Wall Panel Display series with DDF prefix
    c.execute('''
        INSERT INTO Series (name, nameCn, slug, prefix, description, sortOrder, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('Tile Wall Panel Display', 'Tile Wall Panel Display', 'tile-wall-panel-display', 'DDF',
          'Custom tile wall panel display racks for trade shows and showroom feature walls.',
          16, now, now))
    ddf_id = c.lastrowid
    print(f'Added Tile Wall Panel Display series (id={ddf_id}, prefix=DDF)')

    # 2. Fix Carpet Display Rack - change prefix from DL to CP
    c.execute('UPDATE Series SET prefix = ? WHERE slug = ?', ('CP', 'carpet-display-rack'))
    print('Fixed Carpet Display Rack prefix: DL -> CP')

    # 3. Add the DDF products that were skipped
    ddf_products = [
        ('DDF001-1', 'Tailor-Made Tile Wall Panel Display Rack',
         'Custom tile wall panel display rack designed to reflect your brand vision. Full customization of size, color, and configuration.',
         'Steel + Aluminum', 'Full customization; Wall panel format; Brand-specific design'),
        ('DDF001-6', 'Tile Wall Panel Display Rack - Brand Customized',
         'Wall panel display rack customized to reflect your brand identity. Premium construction with adjustable panel configurations.',
         'Steel + Aluminum', 'Brand customization; Adjustable panels; Premium finish'),
        ('DDF001-8', 'Personalized Tile Wall Panel Display Rack',
         'Express your creativity with this personalized tile wall panel display rack. Flexible design accommodates various tile sizes.',
         'Steel + Aluminum', 'Personalized design; Flexible configuration; Multi-size support'),
        ('DDF001-15', 'Custom Tile Wall Panel Display Rack - Create Your Look',
         'Create your own look with this fully customizable tile wall panel display rack. Ideal for trade show displays.',
         'Steel + Aluminum', 'Full custom design; Trade show ready; Feature wall capable'),
        ('DDF001-12', 'Tile Wall Panel Display Rack - Style Customized',
         'Tile wall panel display rack customized for your specific style requirements. Clean, modern design with robust construction.',
         'Steel + Aluminum', 'Style customization; Modern design; Robust construction'),
        ('DDF001-3', 'Custom-Tailored Tile Wall Panel Display Rack',
         'Custom-tailored tile wall panel display rack to fit your specific needs. Adjustable shelf heights and panel configurations.',
         'Steel + Aluminum', 'Custom-tailored fit; Adjustable shelves; Modular design'),
        ('DDF001-11', 'Tile Wall Panel Display Rack for Trade Shows',
         'Stand out at trade shows with this portable tile wall panel display rack. Easy assembly and disassembly for event use.',
         'Steel + Aluminum', 'Trade show optimized; Portable; Easy assembly'),
        ('N2002', 'Trend-Setting Tile Wall Panel Display Rack',
         'Embrace trend-setting design with this innovative tile wall panel display rack. Contemporary aesthetic meets practical functionality.',
         'Steel + Aluminum', 'Trend-setting design; Contemporary aesthetic; Practical function'),
        ('DDF002-2', 'Exquisite Design Tile Wall Panel Display Rack',
         'Experience exquisite design with this premium tile wall panel display rack. Sophisticated construction for high-end showrooms.',
         'Steel + Aluminum', 'Exquisite design; Premium construction; High-end finish'),
    ]

    added = 0
    for sku, name, desc, material, features in ddf_products:
        existing = c.execute('SELECT id FROM Product WHERE sku = ?', (sku,)).fetchone()
        if existing:
            print(f'  SKIP (exists): {sku}')
            continue
        c.execute('''
            INSERT INTO Product (sku, seriesId, name, description, material, features,
                                 isFeatured, isPublished, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?, ?, ?)
        ''', (sku, ddf_id, name, desc, material, features, added, now, now))
        pid = c.lastrowid
        c.execute('''
            INSERT INTO ProductImage (productId, url, alt, sortOrder, isPrimary)
            VALUES (?, ?, ?, 0, 1)
        ''', (pid, f'/images/products/{sku.lower()}.jpg', name[:100]))
        added += 1
        print(f'  ADDED: {sku} | {name[:50]}...')

    print(f'\nDDF products added: {added}')
    conn.commit()

    # Final summary
    total = c.execute('SELECT COUNT(*) FROM Product').fetchone()[0]
    total_series = c.execute('SELECT COUNT(*) FROM Series').fetchone()[0]
    print(f'\nTotal series: {total_series}')
    print(f'Total products: {total}')
    print('\nProducts per series:')
    for row in c.execute('SELECT s.name, s.prefix, COUNT(p.id) FROM Series s LEFT JOIN Product p ON p.seriesId = s.id GROUP BY s.id ORDER BY s.id'):
        print(f'  {row[0]} ({row[1]}): {row[2]} products')

    conn.close()

if __name__ == '__main__':
    main()
