#!/usr/bin/env python3
"""
1. Mark 1-2 products per series as featured (total ~17 featured products)
2. Generate reasonable specs for all products based on series prefix
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')

# Spec templates by series prefix
# (standSize, panelSize, panelThickness, packageSize, numberOfPanel, weight, adjustablePanelSize)
SPEC_TEMPLATES = {
    'CT': {  # Wall Sliding Rack
        'standSize': '120x60x180cm',
        'panelSize': '60x60cm - 120x240cm',
        'panelThickness': '9-15mm',
        'packageSize': '125x65x15cm',
        'numberOfPanel': '6-10 panels',
        'weight': '45-65kg',
        'adjustablePanelSize': True,
    },
    'CC': {  # Drawer Cabinet
        'standSize': '100x50x120cm',
        'panelSize': '30x30cm - 60x60cm',
        'panelThickness': '8-12mm',
        'packageSize': '105x55x125cm',
        'numberOfPanel': '8-15 drawers',
        'weight': '55-80kg',
        'adjustablePanelSize': True,
    },
    'CH': {  # Combination Frame
        'standSize': '200x40x220cm',
        'panelSize': '60x120cm - 120x240cm',
        'panelThickness': '9-20mm',
        'packageSize': '205x45x225cm',
        'numberOfPanel': '8-12 panels',
        'weight': '80-120kg',
        'adjustablePanelSize': True,
    },
    'CF': {  # Page-turning Stand
        'standSize': '60x45x150cm',
        'panelSize': '30x60cm - 60x120cm',
        'panelThickness': '8-15mm',
        'packageSize': '65x50x155cm',
        'numberOfPanel': '15-30 pages',
        'weight': '35-50kg',
        'adjustablePanelSize': False,
    },
    'CX': {  # Reclining Frame
        'standSize': '120x50x160cm',
        'panelSize': '80x160cm - 120x240cm',
        'panelThickness': '7-9.5mm',
        'packageSize': '125x55x165cm',
        'numberOfPanel': '4-6 panels',
        'weight': '40-60kg',
        'adjustablePanelSize': True,
    },
    'CE': {  # Simple Frame
        'standSize': '50x40x120cm',
        'panelSize': '30x30cm - 60x60cm',
        'panelThickness': '8-12mm',
        'packageSize': '55x45x125cm',
        'numberOfPanel': '4-6 panels',
        'weight': '15-25kg',
        'adjustablePanelSize': False,
    },
    'CL': {  # Floor-standing Rack
        'standSize': '80x50x180cm',
        'panelSize': '30x60cm - 60x60cm',
        'panelThickness': '10-20mm',
        'packageSize': '85x55x185cm',
        'numberOfPanel': '8-12 panels',
        'weight': '50-70kg',
        'adjustablePanelSize': True,
    },
    'LD': {  # Stone Display Rack
        'standSize': '100x60x200cm',
        'panelSize': '60x60cm - 160x320cm',
        'panelThickness': '12-30mm',
        'packageSize': '105x65x205cm',
        'numberOfPanel': '6-10 panels',
        'weight': '70-100kg',
        'adjustablePanelSize': True,
    },
    'WD': {  # Wood Flooring Display Rack
        'standSize': '120x40x150cm',
        'panelSize': '15x90cm - 20x120cm',
        'panelThickness': '8-15mm',
        'packageSize': '125x45x155cm',
        'numberOfPanel': '10-20 panels',
        'weight': '40-55kg',
        'adjustablePanelSize': True,
    },
    'DL': {  # Door & Window Display Rack
        'standSize': '100x50x210cm',
        'panelSize': '80x210cm - 100x210cm',
        'panelThickness': 'N/A',
        'packageSize': '105x55x215cm',
        'numberOfPanel': '2-4 panels',
        'weight': '60-90kg',
        'adjustablePanelSize': False,
    },
    'PP': {  # Sample Box & Book Display
        'standSize': '35x25x15cm',
        'panelSize': '15x20cm - 20x30cm',
        'panelThickness': '5-15mm',
        'packageSize': '40x30x20cm',
        'numberOfPanel': '20-50 samples',
        'weight': '3-8kg',
        'adjustablePanelSize': False,
    },
    'STB': {  # MDF Board Display
        'standSize': '80x60x180cm',
        'panelSize': '60x120cm - 80x180cm',
        'panelThickness': '3-18mm',
        'packageSize': '85x65x185cm',
        'numberOfPanel': '5-8 panels',
        'weight': '45-65kg',
        'adjustablePanelSize': True,
    },
    'LX': {  # Mosaic Display Rack
        'standSize': '60x40x120cm',
        'panelSize': '30x30cm - 50x50cm',
        'panelThickness': '4-10mm',
        'packageSize': '65x45x125cm',
        'numberOfPanel': '10-20 panels',
        'weight': '20-35kg',
        'adjustablePanelSize': True,
    },
    'BT': {  # Bathroom Display
        'standSize': '50x40x150cm',
        'panelSize': '30x60cm - 60x60cm',
        'panelThickness': '8-12mm',
        'packageSize': '55x45x155cm',
        'numberOfPanel': '4-8 panels',
        'weight': '25-40kg',
        'adjustablePanelSize': True,
    },
    'PT': {  # Painting Sample Display
        'standSize': '80x50x170cm',
        'panelSize': '20x30cm - 40x60cm',
        'panelThickness': 'N/A',
        'packageSize': '85x55x175cm',
        'numberOfPanel': '20-40 pages',
        'weight': '35-50kg',
        'adjustablePanelSize': False,
    },
    'DDF': {  # Tile Wall Panel Display
        'standSize': '150x8x240cm',
        'panelSize': '60x120cm - 90x180cm',
        'panelThickness': '9-15mm',
        'packageSize': '155x13x245cm',
        'numberOfPanel': '4-8 panels',
        'weight': '50-70kg',
        'adjustablePanelSize': True,
    },
    'CP': {  # Carpet Display Rack
        'standSize': '80x50x160cm',
        'panelSize': '50x50cm - 80x120cm',
        'panelThickness': 'N/A',
        'packageSize': '85x55x165cm',
        'numberOfPanel': '6-12 panels',
        'weight': '30-45kg',
        'adjustablePanelSize': True,
    },
}


def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # === 1. Mark featured products (1-2 per series) ===
    # Clear existing featured flags first
    c.execute('UPDATE Product SET isFeatured = 0')
    
    # Get all series with their products
    c.execute('''
        SELECT s.id, s.prefix, s.name 
        FROM Series s 
        WHERE EXISTS (SELECT 1 FROM Product p WHERE p.seriesId = s.id AND p.isPublished = 1)
        ORDER BY s.sortOrder
    ''')
    series_list = c.fetchall()
    
    featured_count = 0
    for series_id, prefix, series_name in series_list:
        # Mark first 1-2 products as featured
        c.execute('''
            SELECT p.id FROM Product p 
            WHERE p.seriesId = ? AND p.isPublished = 1 
            ORDER BY p.sortOrder LIMIT 2
        ''', (series_id,))
        products = c.fetchall()
        for (pid,) in products:
            c.execute('UPDATE Product SET isFeatured = 1 WHERE id = ?', (pid,))
            featured_count += 1
    
    print(f"Marked {featured_count} products as featured across {len(series_list)} series")

    # === 2. Update specs for all products ===
    c.execute('SELECT id, sku, seriesId FROM Product WHERE isPublished = 1')
    products = c.fetchall()
    
    # Build series prefix map
    c.execute('SELECT id, prefix FROM Series')
    series_prefix_map = {sid: prefix for sid, prefix in c.fetchall()}
    
    specs_updated = 0
    for pid, sku, series_id in products:
        prefix = series_prefix_map.get(series_id)
        if not prefix:
            continue
        
        specs = SPEC_TEMPLATES.get(prefix)
        if not specs:
            continue
        
        c.execute('''
            UPDATE Product SET 
                standSize = ?, 
                panelSize = ?, 
                panelThickness = ?, 
                packageSize = ?, 
                numberOfPanel = ?, 
                weight = ?,
                adjustablePanelSize = ?
            WHERE id = ?
        ''', (
            specs['standSize'],
            specs['panelSize'],
            specs['panelThickness'],
            specs['packageSize'],
            specs['numberOfPanel'],
            specs['weight'],
            specs['adjustablePanelSize'],
            pid
        ))
        specs_updated += 1
    
    print(f"Updated specs for {specs_updated} products")
    
    conn.commit()
    
    # Summary
    c.execute('SELECT COUNT(*) FROM Product WHERE isFeatured = 1')
    print(f"\nTotal featured products: {c.fetchone()[0]}")
    c.execute('SELECT COUNT(*) FROM Product WHERE standSize IS NOT NULL')
    print(f"Products with specs: {c.fetchone()[0]}")
    
    # Show featured products by series
    c.execute('''
        SELECT s.prefix, s.name, COUNT(p.id) as cnt 
        FROM Series s 
        JOIN Product p ON p.seriesId = s.id 
        WHERE p.isFeatured = 1 
        GROUP BY s.id ORDER BY s.sortOrder
    ''')
    print("\nFeatured products by series:")
    for prefix, name, cnt in c.fetchall():
        print(f"  {prefix:6s} | {name:40s} | {cnt} featured")
    
    conn.close()


if __name__ == '__main__':
    main()
