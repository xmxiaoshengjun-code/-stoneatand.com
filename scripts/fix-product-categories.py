#!/usr/bin/env python3
"""
Fix product category hierarchy.

Inserts 10 parent categories into the Series table (matching chndisplay.net
structure) and updates the 17 existing leaf series to point to the correct
parent via parentId.

Usage:
    python scripts/fix-product-categories.py

Safety: Idempotent — if parent categories already exist (matched by slug),
they are skipped and only the parentId updates are applied.
"""

import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')

# ---------------------------------------------------------------------------
# Parent category definitions (slug, name, nameCn, description, prefix)
# ---------------------------------------------------------------------------
PARENT_CATEGORIES = [
    {
        'slug': 'tile-displays-rack',
        'name': 'Tile Displays Rack',
        'nameCn': '瓷砖展示架',
        'description': 'Display racks and stands for ceramic and porcelain tiles, including wall sliding racks, drawer cabinets, combination frames, page-turning stands, reclining frames, simple frames, floor-standing racks, and tile wall panel displays.',
        'prefix': 'TDR',
    },
    {
        'slug': 'stone-displays-rack',
        'name': 'Stone Displays Rack',
        'nameCn': '石材展示架',
        'description': 'Display racks designed for stone and artificial stone samples, built to support heavy stone slabs.',
        'prefix': 'SDR',
    },
    {
        'slug': 'wooden-flooring-display-rack',
        'name': 'Wooden Flooring Display Rack',
        'nameCn': '木地板展示架',
        'description': 'Display racks for wood flooring and laminate samples, optimized for angle presentation and texture visibility.',
        'prefix': 'WFD',
    },
    {
        'slug': 'door-and-window-display-racks',
        'name': 'Door and Window Display Racks',
        'nameCn': '门窗展示架',
        'description': 'Display racks for door and window products, highlighting craftsmanship, design, and material quality.',
        'prefix': 'DWR',
    },
    {
        'slug': 'samples-box-books-display',
        'name': 'Samples Box Books Display',
        'nameCn': '样品箱册展示',
        'description': 'Portable sample boxes and books for stone, tile, and material samples. Compact for client visits and trade shows.',
        'prefix': 'SBB',
    },
    {
        'slug': 'mdf-board-displays',
        'name': 'MDF Board Displays',
        'nameCn': '密度板展示',
        'description': 'MDF board displays with smooth surface finish, excellent processing performance for custom display designs.',
        'prefix': 'MDF',
    },
    {
        'slug': 'carpet-display-rack',
        'name': 'Carpet Display Rack',
        'nameCn': '地毯展示架',
        'description': 'Display racks for carpet and flooring samples, protecting samples while showcasing patterns and textures.',
        'prefix': 'CDR',
    },
    {
        'slug': 'bathroom-displays',
        'name': 'Bathroom Displays',
        'nameCn': '卫浴展示',
        'description': 'Bathroom display stands for tile and fixture samples. Compact and moisture-resistant for showroom use.',
        'prefix': 'BTD',
    },
    {
        'slug': 'mosaic-display-rack',
        'name': 'Mosaic Display Rack',
        'nameCn': '马赛克展示架',
        'description': 'Display racks for mosaic tile samples with modular design and flexible arrangement options.',
        'prefix': 'MDR',
    },
    {
        'slug': 'painting-sample-display-rack',
        'name': 'Painting Sample Display Rack',
        'nameCn': '涂料样品展示架',
        'description': 'Painting sample display racks with page-turning and rotating mechanisms, large capacity for diverse collections.',
        'prefix': 'PDR',
    },
]

# ---------------------------------------------------------------------------
# Mapping: parent_slug -> list of child series slugs (existing leaf series)
# ---------------------------------------------------------------------------
CHILD_MAPPING = {
    'tile-displays-rack': [
        'wall-sliding-rack',        # CT
        'drawer-cabinet',           # CC
        'combination-frame',        # CH
        'page-turning-stand',       # CF
        'reclining-frame',          # CX
        'simple-frame',             # CE
        'floor-standing-rack',      # CL
        'tile-wall-panel-display',  # DDF
    ],
    'stone-displays-rack': [
        'stone-display-rack',       # LD
    ],
    'wooden-flooring-display-rack': [
        'wood-flooring-display-rack',  # WD
    ],
    'door-and-window-display-racks': [
        'door-window-display-rack',    # DL
    ],
    'samples-box-books-display': [
        'sample-box-book-display',  # PP
    ],
    'mdf-board-displays': [
        'mdf-board-display',        # STB
    ],
    'carpet-display-rack': [
        # carpet-display-rack is both parent AND leaf — same slug.
        # No separate child; the existing series itself is the root.
    ],
    'bathroom-displays': [
        'bathroom-display',         # BT
    ],
    'mosaic-display-rack': [
        # mosaic-display-rack is both parent AND leaf — same slug.
        # No separate child; the existing series itself is the root.
    ],
    'painting-sample-display-rack': [
        'painting-sample-display',  # PT
    ],
}


def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    # -----------------------------------------------------------------------
    # Step 1: Insert parent categories (idempotent — skip if slug exists)
    # -----------------------------------------------------------------------
    parent_id_map = {}  # slug -> id

    for idx, parent in enumerate(PARENT_CATEGORIES, start=1):
        # Check if already exists
        c.execute('SELECT id FROM Series WHERE slug = ?', (parent['slug'],))
        existing = c.fetchone()
        if existing:
            parent_id_map[parent['slug']] = existing[0]
            # Ensure existing leaf-parent has NULL parentId (no self-reference)
            # and correct sortOrder to align with parent sequence
            c.execute(
                'UPDATE Series SET parentId = NULL, sortOrder = ? WHERE id = ?',
                (idx, existing[0])
            )
            print(f"  [SKIP] Parent '{parent['slug']}' already exists (id={existing[0]}), ensured parentId=NULL, sortOrder={idx}")
            continue

        # Insert new parent category
        c.execute(
            '''INSERT INTO Series (name, nameCn, slug, prefix, description, image,
               parentId, sortOrder, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?)''',
            (
                parent['name'],
                parent['nameCn'],
                parent['slug'],
                parent['prefix'],
                parent['description'],
                idx,  # sortOrder 1-10 for parents
                now,
                now,
            )
        )
        new_id = c.lastrowid
        parent_id_map[parent['slug']] = new_id
        print(f"  [INSERT] Parent '{parent['slug']}' -> id={new_id}")

    conn.commit()

    # -----------------------------------------------------------------------
    # Step 2: Update child series parentId
    # -----------------------------------------------------------------------
    updated_count = 0
    for parent_slug, child_slugs in CHILD_MAPPING.items():
        parent_id = parent_id_map[parent_slug]
        for child_slug in child_slugs:
            c.execute(
                'UPDATE Series SET parentId = ?, updatedAt = ? WHERE slug = ?',
                (parent_id, now, child_slug)
            )
            if c.rowcount > 0:
                updated_count += 1
                print(f"  [UPDATE] '{child_slug}' -> parentId={parent_id} ({parent_slug})")
            else:
                print(f"  [WARN] Child series '{child_slug}' not found in DB!")

    conn.commit()

    # -----------------------------------------------------------------------
    # Step 3: Verification — print full hierarchy
    # -----------------------------------------------------------------------
    print("\n" + "=" * 80)
    print("VERIFICATION: Series hierarchy after fix")
    print("=" * 80)

    # Parents with their children
    c.execute('''
        SELECT p.id, p.slug, p.name, p.sortOrder, p.parentId
        FROM Series p
        WHERE p.parentId IS NULL
        ORDER BY p.sortOrder ASC, p.id ASC
    ''')
    parents = c.fetchall()

    for parent_id, parent_slug, parent_name, parent_sort, _ in parents:
        c.execute('''
            SELECT id, slug, name, prefix
            FROM Series
            WHERE parentId = ?
            ORDER BY sortOrder ASC, id ASC
        ''', (parent_id,))
        children = c.fetchall()

        if children:
            print(f"\n  [Parent #{parent_id}] {parent_name} ({parent_slug}) — {len(children)} children:")
            for child_id, child_slug, child_name, child_prefix in children:
                print(f"    └─ [{child_prefix}] {child_name} ({child_slug}) [id={child_id}]")
        else:
            # Leaf with no parent and no children — could be an orphan
            print(f"\n  [Orphan #{parent_id}] {parent_name} ({parent_slug}) — no children, no parent")

    # Summary stats
    c.execute('SELECT COUNT(*) FROM Series WHERE parentId IS NULL')
    total_roots = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM Series WHERE parentId IS NOT NULL')
    total_children = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM Series')
    total_all = c.fetchone()[0]

    print(f"\n  Summary: {total_all} total series = {total_roots} roots + {total_children} children")
    print(f"  Updated {updated_count} child series parentId values.")

    conn.close()
    print("\nDone! DB fix completed successfully.")


if __name__ == '__main__':
    print("=" * 80)
    print("Fix Product Categories: Insert 10 parent categories + set child parentId")
    print(f"DB: {DB_PATH}")
    print("=" * 80)
    main()
