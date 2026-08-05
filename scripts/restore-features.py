#!/usr/bin/env python3
"""Restore features for original 125 products that lost them."""
import sqlite3, json, os

DB_PATH = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')

FEATURE_TEMPLATES = {
    'CT': ['Sliding panel mechanism', 'Adjustable panel angles', 'Wall-mounted design', 'Space-efficient'],
    'CC': ['Drawer-style storage', 'Lockable drawers', 'Removable sample trays', 'Dust-proof design'],
    'CH': ['Modular combination system', 'Freely configurable layout', 'Heavy-duty frame', 'Showroom main wall'],
    'CF': ['Page-turning mechanism', 'Compact footprint', 'Batch display capability', 'Smooth flip action'],
    'CX': ['Reclining angle display', 'Ultra-thin panel support', 'Installation effect simulation', 'Adjustable tilt'],
    'CE': ['Single-piece design', 'Compact and versatile', 'Easy relocation', 'Cost-effective'],
    'CL': ['Freestanding design', 'Double-sided display', 'Movable with wheels', 'Punched hole panel'],
    'LD': ['Heavy-duty construction', 'Stone slab support', 'Adjustable shelving', 'Reinforced frame'],
    'WD': ['Angled presentation', 'Wood flooring optimized', 'Multiple sample tiers', 'Texture visibility focus'],
    'DL': ['Door/window display', 'Sturdy vertical frame', 'Adjustable mounting', 'Highlight craftsmanship'],
    'PP': ['Portable design', 'Sample box format', 'Compact for travel', 'Trade show ready'],
    'STB': ['Smooth MDF surface', 'Custom cutouts', 'Stable construction', 'Easy maintenance'],
    'DDF': ['Wall panel system', 'Vertical presentation', 'Space-efficient', 'Large format tile support'],
}

PANEL_INFO = {
    'CT': '6-10 panels', 'CC': '8-15 drawers', 'CH': '8-12 panels',
    'CF': '15-30 pages', 'CX': '4-6 panels', 'CE': '4-6 panels',
    'CL': '8-12 panels', 'LD': '6-10 panels', 'WD': '10-20 panels',
    'DL': '2-4 panels', 'PP': '20-50 samples', 'STB': '5-8 panels',
    'LX': '10-20 panels', 'BT': '4-8 panels', 'PT': '20-40 pages',
    'DDF': '4-8 panels', 'CP': '6-12 panels',
}

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, prefix FROM Series')
    prefix_map = {sid: prefix for sid, prefix in c.fetchall()}

    c.execute('SELECT id, sku, features, seriesId FROM Product')
    updated = 0
    for pid, sku, features_str, series_id in c.fetchall():
        prefix = prefix_map.get(series_id)
        if not prefix:
            continue
        try:
            features = json.loads(features_str) if features_str else []
            if len(features) > 1:
                continue
        except:
            features = []

        template = FEATURE_TEMPLATES.get(prefix, ['Quality construction', 'Durable design'])
        panel_info = PANEL_INFO.get(prefix, '')
        new_features = list(template)
        if panel_info:
            new_features.append('Capacity: ' + panel_info)

        c.execute('UPDATE Product SET features = ? WHERE id = ?', (json.dumps(new_features), pid))
        updated += 1

    conn.commit()
    print('Restored features for {} products'.format(updated))
    c.execute('SELECT sku, features FROM Product WHERE sku IN ("SG601","CT011","DL028","MT001-3")')
    for row in c.fetchall():
        print('  {} | {}'.format(row[0], row[1][:100]))
    conn.close()

if __name__ == '__main__':
    main()
