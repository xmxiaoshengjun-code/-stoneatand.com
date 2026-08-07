#!/usr/bin/env python3
"""QA Verification script for product category fix."""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # 1. Total Series count
    c.execute('SELECT COUNT(*) FROM Series')
    total = c.fetchone()[0]
    print(f'Total Series records: {total}')

    # 2. Parent categories (parentId IS NULL)
    c.execute('SELECT id, slug, name, nameCn, prefix, parentId, sortOrder FROM Series WHERE parentId IS NULL ORDER BY sortOrder')
    parents = c.fetchall()
    print(f'\nParent categories (parentId IS NULL): {len(parents)}')
    for p in parents:
        print(f'  id={p[0]}, slug={p[1]}, name={p[2]}, nameCn={p[3]}, prefix={p[4]}, parentId={p[5]}, sortOrder={p[6]}')

    # 3. Child series (parentId IS NOT NULL)
    c.execute('SELECT id, slug, name, prefix, parentId FROM Series WHERE parentId IS NOT NULL ORDER BY parentId, sortOrder')
    children = c.fetchall()
    print(f'\nChild series (parentId IS NOT NULL): {len(children)}')
    for ch in children:
        c.execute('SELECT slug FROM Series WHERE id = ?', (ch[4],))
        parent_row = c.fetchone()
        parent_slug = parent_row[0] if parent_row else 'NOT FOUND'
        print(f'  id={ch[0]}, slug={ch[1]}, name={ch[2]}, prefix={ch[3]}, parentId={ch[4]}, parentSlug={parent_slug}')

    # 4. Self-referencing check
    c.execute('SELECT id, slug, parentId FROM Series WHERE parentId = id')
    self_refs = c.fetchall()
    print(f'\nSelf-referencing records (parentId = id): {len(self_refs)}')
    for sr in self_refs:
        print(f'  id={sr[0]}, slug={sr[1]}, parentId={sr[2]}')

    # 5. Orphaned children (parentId points to non-existent record)
    c.execute('SELECT s.id, s.slug, s.parentId FROM Series s WHERE s.parentId IS NOT NULL AND s.parentId NOT IN (SELECT id FROM Series)')
    orphans = c.fetchall()
    print(f'\nOrphaned children (parentId not found in Series): {len(orphans)}')
    for o in orphans:
        print(f'  id={o[0]}, slug={o[1]}, parentId={o[2]}')

    # 6. Product count
    c.execute('SELECT COUNT(*) FROM Product')
    total_products = c.fetchone()[0]
    print(f'\nTotal products: {total_products}')

    # 7. Products with invalid seriesId
    c.execute('SELECT COUNT(*) FROM Product p WHERE p.seriesId NOT IN (SELECT id FROM Series)')
    invalid_products = c.fetchone()[0]
    print(f'Products with invalid seriesId: {invalid_products}')

    # 8. Products per seriesId
    c.execute('SELECT s.slug, s.prefix, COUNT(p.id) as cnt FROM Series s LEFT JOIN Product p ON p.seriesId = s.id GROUP BY s.id ORDER BY s.sortOrder')
    prod_per_series = c.fetchall()
    print(f'\nProducts per series:')
    for pps in prod_per_series:
        print(f'  slug={pps[0]}, prefix={pps[1]}, products={pps[2]}')

    # 9. Products per parent category
    print(f'\nProducts per parent category (including children products):')
    for parent in parents:
        c.execute('SELECT COUNT(*) FROM Product p JOIN Series s ON p.seriesId = s.id WHERE s.parentId = ? OR s.id = ?', (parent[0], parent[0]))
        cnt = c.fetchone()[0]
        print(f'  {parent[1]} ({parent[4]}): {cnt} products')

    # 10. Parent slug vs NAV_ITEMS check
    nav_slugs = [
        'tile-displays-rack',
        'stone-displays-rack',
        'wooden-flooring-display-rack',
        'door-and-window-display-racks',
        'samples-box-books-display',
        'mdf-board-displays',
        'carpet-display-rack',
        'bathroom-displays',
        'mosaic-display-rack',
        'painting-sample-display-rack',
    ]
    db_parent_slugs = [p[1] for p in parents]
    print(f'\nNAV_ITEMS slugs vs DB parent slugs:')
    for ns in nav_slugs:
        match = ns in db_parent_slugs
        status = 'MATCH' if match else 'MISMATCH'
        print(f'  {ns}: {status}')

    for ds in db_parent_slugs:
        if ds not in nav_slugs:
            print(f'  DB slug "{ds}" NOT in NAV_ITEMS!')

    # 11. Check for old slugs still in DB
    old_slugs = ['tile-display', 'stone-display', 'wood-flooring-display', 'sample-cabinet', 'mosaic-decor', 'other-display']
    print(f'\nOld slug check in Series table:')
    for os in old_slugs:
        c.execute('SELECT id, slug FROM Series WHERE slug = ?', (os,))
        found = c.fetchone()
        if found:
            print(f'  FOUND old slug: {found[1]} (id={found[0]})')
        else:
            print(f'  OK - old slug "{os}" not found')

    # 12. carpet-display-rack and mosaic-display-rack: check if they are both parent AND have products
    for slug in ['carpet-display-rack', 'mosaic-display-rack']:
        c.execute('SELECT id FROM Series WHERE slug = ?', (slug,))
        row = c.fetchone()
        if row:
            sid = row[0]
            # Check if it has children
            c.execute('SELECT COUNT(*) FROM Series WHERE parentId = ?', (sid,))
            child_count = c.fetchone()[0]
            # Check if it has products directly
            c.execute('SELECT COUNT(*) FROM Product WHERE seriesId = ?', (sid,))
            prod_count = c.fetchone()[0]
            print(f'\n  {slug}: id={sid}, children={child_count}, direct_products={prod_count}')

    conn.close()
    print('\n--- DB Verification Complete ---')

if __name__ == '__main__':
    main()
