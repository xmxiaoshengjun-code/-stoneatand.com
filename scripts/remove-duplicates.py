"""
Remove 4 duplicate products identified by perceptual hash analysis.
Keep: VS063, TM049-1, WDR002-5, WDR005-4
Delete: VZ012, TM049-3, WDR002-3, WDR005-5
"""
import sqlite3
import os

DB_PATH = 'scripts/qianfan-seed2.db'
IMG_DIR = 'public/images/products'

# Products to delete: (id, sku, image_filename)
TO_DELETE = [
    (161, 'VZ012',    'vz012.jpg'),
    (111, 'TM049-3',  'tm049-3.jpg'),
    (76,  'WDR002-3', 'wdr002-3.jpg'),
    (81,  'WDR005-5', 'wdr005-5.jpg'),
]

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

print('=== BEFORE: Product count ===')
cursor = conn.execute('SELECT COUNT(*) as cnt FROM Product')
print(f'  Total products: {cursor.fetchone()["cnt"]}')
cursor = conn.execute('SELECT COUNT(*) as cnt FROM ProductImage')
print(f'  Total images: {cursor.fetchone()["cnt"]}')

deleted_files = []
for pid, sku, img_file in TO_DELETE:
    print(f'\n--- Deleting {sku} (ID={pid}) ---')

    # 1. Delete ProductImage records
    cursor = conn.execute('DELETE FROM ProductImage WHERE "productId" = ?', (pid,))
    print(f'  Deleted {cursor.rowcount} ProductImage record(s)')

    # 2. Delete Product record
    cursor = conn.execute('DELETE FROM Product WHERE id = ?', (pid,))
    print(f'  Deleted {cursor.rowcount} Product record(s)')

    # 3. Delete image file
    img_path = os.path.join(IMG_DIR, img_file)
    if os.path.exists(img_path):
        os.remove(img_path)
        deleted_files.append(img_file)
        print(f'  Deleted image file: {img_file}')
    else:
        print(f'  Image file not found: {img_file}')

conn.commit()

print('\n=== AFTER: Product count ===')
cursor = conn.execute('SELECT COUNT(*) as cnt FROM Product')
print(f'  Total products: {cursor.fetchone()["cnt"]}')
cursor = conn.execute('SELECT COUNT(*) as cnt FROM ProductImage')
print(f'  Total images: {cursor.fetchone()["cnt"]}')

# Verify deleted products are gone
print('\n=== Verification ===')
for pid, sku, img_file in TO_DELETE:
    cursor = conn.execute('SELECT COUNT(*) as cnt FROM Product WHERE sku = ?', (sku,))
    cnt = cursor.fetchone()['cnt']
    status = 'GONE' if cnt == 0 else f'STILL EXISTS ({cnt})'
    print(f'  {sku}: {status}')

# Verify image files are gone
for pid, sku, img_file in TO_DELETE:
    img_path = os.path.join(IMG_DIR, img_file)
    exists = os.path.exists(img_path)
    status = 'GONE' if not exists else 'STILL EXISTS'
    print(f'  {img_file}: {status}')

conn.close()
print('\nDone! 4 duplicate products removed.')
