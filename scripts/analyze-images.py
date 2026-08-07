from PIL import Image
import sqlite3, os, json
from collections import defaultdict

# Perceptual hash function (average hash)
def ahash(img, hash_size=16):
    img = img.convert('L').resize((hash_size, hash_size), Image.LANCZOS)
    pixels = list(img.getdata())
    avg = sum(pixels) / len(pixels)
    return ''.join('1' if p >= avg else '0' for p in pixels)

def hamming_distance(h1, h2):
    return sum(c1 != c2 for c1, c2 in zip(h1, h2))

# Load DB mapping
conn = sqlite3.connect('scripts/qianfan-seed2.db')
conn.row_factory = sqlite3.Row
cursor = conn.execute('''
    SELECT pi.url, p.sku, p.name, s.slug as series_slug, s.name as series_name
    FROM ProductImage pi
    JOIN Product p ON pi."productId" = p.id
    LEFT JOIN Series s ON p."seriesId" = s.id
''')
rows = [dict(r) for r in cursor.fetchall()]
conn.close()

img_dir = 'public/images/products'
hash_map = {}
print('=== Computing perceptual hashes... ===')
for r in rows:
    fname = r['url'].split('/')[-1]
    path = os.path.join(img_dir, fname)
    try:
        img = Image.open(path)
        h = ahash(img)
        r['hash'] = h
        r['file'] = fname
        r['size'] = img.size
        hash_map[fname] = r
    except Exception as e:
        print(f'Error opening {fname}: {e}')

# Group by series and find similar pairs within same series
print('\n=== VISUALLY SIMILAR IMAGES WITHIN SAME CATEGORY ===')
series_groups = defaultdict(list)
for r in rows:
    if 'hash' in r:
        series_groups[r['series_slug'] or 'no-series'].append(r)

similar_groups = []
for series, items in sorted(series_groups.items()):
    pairs = []
    for i in range(len(items)):
        for j in range(i+1, len(items)):
            d = hamming_distance(items[i]['hash'], items[j]['hash'])
            if d <= 10:
                pairs.append((items[i], items[j], d))
    if pairs:
        parent = {item['file']: item['file'] for item in items}
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(x, y):
            rx, ry = find(x), find(y)
            if rx != ry:
                parent[rx] = ry
        for a, b, d in pairs:
            union(a['file'], b['file'])
        comps = defaultdict(list)
        for item in items:
            comps[find(item['file'])].append(item)
        print(f'\n--- {series} ({items[0]["series_name"]}) ---')
        for root, members in comps.items():
            if len(members) > 1:
                similar_groups.append(members)
                print(f'  SIMILAR GROUP ({len(members)} items):')
                for m in members:
                    print(f'    - {m["file"]:25s} SKU: {m["sku"]:15s} Size: {m["size"]} Name: {m["name"][:50]}')

print(f'\n=== SUMMARY ===')
print(f'Total visually similar groups found: {len(similar_groups)}')
print(f'Total images in these groups: {sum(len(g) for g in similar_groups)}')

# Save to JSON for later use
os.makedirs('scripts/output', exist_ok=True)
with open('scripts/output/similar-groups.json', 'w', encoding='utf-8') as f:
    serializable = [
        [{k: m[k] for k in ['file', 'sku', 'name', 'series_slug', 'series_name', 'url', 'size']} for m in g]
        for g in similar_groups
    ]
    json.dump(serializable, f, indent=2, ensure_ascii=False)
print('Saved similar groups to scripts/output/similar-groups.json')
