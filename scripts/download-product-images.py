"""
Download product images from chndisplay.net and save locally.
Uses curl to fetch HTML pages, extract image URLs, then download images.
"""
import subprocess
import os
import re
import sqlite3
import time

DB_PATH = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')
IMG_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'products')
BASE_URL = 'https://chndisplay.net'

# Product slug mapping (SKU -> chndisplay.net product URL slug)
PRODUCT_URLS = {
    'CE089': 'versatile-basic-tile-display-rack-for-countertop-or-wall-mounting-ce089',
    'CC001-4': 'unlock-the-hidden-advantages-of-tile-stone-display-desk-cc001-4',
    'CC001-2': 'capitalize-on-the-distinctive-traits-of-tile-stone-display-desk-cc001-2',
    'DDF001-1': 'tailor-made-tile-wall-panel-displays-rack-your-vision-our-creation-ddf001-1',
    'DDF001-6': 'tile-wall-panel-displays-rack-customized-to-reflect-your-brand-ddf001-6',
    'DDF001-8': 'personalized-tile-wall-panel-displays-rack-express-your-creativity-ddf001-8',
    'DDF001-15': 'create-your-own-look-with-custom-tile-wall-panel-displays-rack-ddf001-15',
    'DDF001-12': 'tile-wall-panel-displays-rack-customized-for-your-style-ddf001-12',
    'DDF001-3': 'custom-tailored-tile-wall-panel-displays-rack-to-fit-your-needs-ddf001-3',
    'DDF001-11': 'tile-wall-panel-displays-rack-for-trade-shows-stand-out-ddf001-11',
    'N2002': 'embrace-the-trend-setting-design-of-tile-wall-panel-displays-rack-n2002',
    'DDF002-2': 'experience-the-exquisite-design-of-tile-wall-panel-displays-rack-ddf002-2',
    'SRT930': 'china-manufacturer-stone-tile-countertop-display-stand-tile-display-stand-srt930',
    'MY004': 'tailor-made-stone-sample-standing-display-rack-your-vision-our-creation-my004',
    'LD017-5': 'design-your-dream-display-rack-with-custom-stone-sample-standing-display-rack-ld017-5',
    'LD018-1': 'custom-engineered-stone-sample-standing-display-rack-ld018-1',
    'LD016-1': 'ceramic-tile-sample-metal-display-rack-for-sample-board-ld016-1',
    'LD015-3': 'hanging-circular-trade-show-sign-sample-display-rack-ld015-3',
    'LD012-4': 'plastic-sheet-material-rack-modern-display-fixtures-with-slate-walls-ld012-4',
    'LD013-1': 'modern-furniture-retail-granite-marble-stone-display-rack-ld013-1',
    'LD012-3': 'wall-display-stand-frame-exhibition-trade-show-marble-rack-ld012-3',
    'LD003-2': 'modern-furniture-retail-shop-marble-stone-display-rack-ld003-2',
    'LD003-3': 'tile-wall-display-stand-frame-exhibition-trade-show-ld003-3',
    'LD004-5': 'custom-exhibition-stainless-steel-system-display-panel-ld004-5',
    'WD3073': 'multi-purpose-practical-wood-floor-stand-wd3073',
    'WJ033': 'thick-and-high-load-bearing-wood-floor-stand-wj033',
    'WDR003-3': 'moisture-proof-treated-durable-wood-floor-stand-wdr003-3',
    'WDR003-2': 'easy-to-install-convenient-wood-floor-stand-wdr003-2',
    'WDR002-5': 'smooth-surface-wood-floor-stand-wdr002-5',
    'WDR002-4': 'easy-assembly-wood-floor-stand-wdr002-4',
    'WDR002-3': 'multi-layer-storage-wood-floor-stand-wdr002-3',
    'WDR002-2': 'simple-designed-wood-floor-stand-wdr002-2',
    'WDF001-4': 'sturdy-solid-wood-floor-stand-wdf001-4',
    'WDF001-2': 'showcasing-a-classic-look-the-classic-look-wood-floor-stand-wdf001-2',
    'WDR005-4': 'featuring-a-lightweight-build-for-easy-moving-the-lightweight-wood-floor-stand-wdr005-4',
    'WDR005-5': 'boasting-a-modern-style-appearance-the-modern-style-wood-floor-stand-wdr005-5',
    'DL030': 'dl030',
    'DT107': 'dt107',
    'DL023': 'dl023',
    'DL027': 'dl027',
    'DL031': 'dl031',
    'DL016': 'dl016',
    'DL004': 'dl004',
    'D001-3': 'wooden-door-stone-display-stand-d001-3',
    'D003-2': 'high-quality-wooden-door-display-rack-d003-2',
    'D005-2': 'tile-sample-display-with-sliding-doors-in-modern-style-d005-2',
    'D004-2': 'door-samples-for-metal-display-stands-d004-2',
    'D002-3': 'portable-metal-holder-wooden-door-rack-wooden-door-rack-d002-3',
    'PP-5': 'tilestonesamplebook-where-tile-stone-possibilities-come-to-life-pp-5',
    'PX018': 'business-tile-sample-case-with-integrated-pulling-rod-px018',
    'PM031': 'modern-wooden-countertop-display-stand-professional-carry-case-pm031',
    'PB021': 'modern-style-display-cabinet-case-acrylic-floor-display-rack-box-tile-display-case-sample-case-pb021',
    'YPHF003-11': 'personalize-your-sample-display-with-custom-marble-sample-display-aluminum-case-yphf003-11',
    'YPHF003-8': 'enhance-your-product-presentations-with-sandstone-sample-display-aluminum-case-yphf003-8',
    'LGX003-5': 'uncover-the-sophisticated-design-details-of-porcelain-veneer-tile-sample-display-aluminum-case-lgx003-5',
    'LGX002-5': 'unveil-the-stylish-design-concept-of-slate-sample-display-aluminum-case-lgx002-5',
    'LGX002-3': 'highlight-the-stand-out-features-of-slate-veneer-sample-display-aluminum-case-lgx002-3',
    'LGX002-4': 'unveil-the-top-notch-benefits-of-engineered-stone-sample-display-aluminum-case-lgx002-4',
    'LX002-5': 'capitalize-on-the-distinctive-traits-of-mosaic-tile-sample-display-aluminum-case-lx002-5',
    'STB001-1': 'customizable-and-compact-stone-sample-board-display-stb002-5',
    'STB002-3': 'adjustable-shelving-system-and-compact-stone-sample-board-display-stb002-3',
    'STB002-2': 'hygienic-and-portable-stone-sample-board-display-stb002-2',
    'STB002-1': 'scratch-resistant-and-compact-stone-sample-board-display-stb002-1',
    'PS006': 'expandable-and-portable-stone-sample-board-display-ps006',
    'TM049-1': 'shock-absorbent-and-lightweight-stone-sample-board-display-tm049-1',
    'TM049-3': 'multi-layered-wood-structure-and-lightweight-stone-sample-board-display-tm049-3',
    'STB001-4': 'ergonomic-and-portable-stone-sample-board-display-stb001-4',
    'STB002-4': 'antiscratch-and-lightweight-stone-sample-board-display-stb002-4',
    'STB001-3': 'shockproof-and-compact-stone-sample-board-display-stb001-3',
    'PS001': 'lightweight-stone-sample-board-display-lightweight-stone-sample-board-display-ps001',
    'PS003': 'adjustable-and-portable-stone-sample-board-display-ps003',
}


def fetch_html(url):
    """Fetch HTML content using curl."""
    try:
        result = subprocess.run(
            ['curl', '-s', '-L', '--max-time', '15', url],
            capture_output=True, text=True, timeout=20
        )
        return result.stdout
    except Exception as e:
        print(f'  ERROR fetching {url}: {e}')
        return ''


def extract_product_image(html):
    """Extract the main product image URL from HTML."""
    # Look for woocommerce product image patterns
    # Pattern 1: data-src in img tags with wp-content/uploads
    patterns = [
        r'<img[^>]+data-src="(https?://[^"]+wp-content/uploads/[^"]+)"',
        r'<img[^>]+src="(https?://[^"]+wp-content/uploads/[^"]+)"',
        r'<img[^>]+data-large_image="(https?://[^"]+wp-content/uploads/[^"]+)"',
    ]
    for pattern in patterns:
        matches = re.findall(pattern, html)
        if matches:
            # Return the first match that looks like a product image (not icon/logo)
            for m in matches:
                if any(skip in m.lower() for skip in ['logo', 'icon', 'favicon', 'banner']):
                    continue
                return m
            return matches[0]
    return None


def download_image(url, filepath):
    """Download an image to a local file."""
    try:
        result = subprocess.run(
            ['curl', '-s', '-L', '--max-time', '20', '-o', filepath, url],
            capture_output=True, timeout=25
        )
        if result.returncode == 0 and os.path.exists(filepath):
            size = os.path.getsize(filepath)
            if size > 1000:  # At least 1KB
                return True
        return False
    except Exception as e:
        print(f'  ERROR downloading {url}: {e}')
        return False


def main():
    os.makedirs(IMG_DIR, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Get all new products (those with placeholder image URLs)
    new_products = c.execute('''
        SELECT p.id, p.sku, pi.id as img_id
        FROM Product p
        JOIN ProductImage pi ON pi.productId = p.id AND pi.isPrimary = 1
        WHERE pi.url LIKE '/images/products/%'
        ORDER BY p.id
    ''').fetchall()

    print(f'Products needing images: {len(new_products)}')
    print('=' * 60)

    success = 0
    failed = 0
    skipped = 0

    for product_id, sku, img_id in new_products:
        sku_lower = sku.lower()
        filepath = os.path.join(IMG_DIR, f'{sku_lower}.jpg')

        # Skip if already downloaded
        if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
            print(f'  SKIP (exists): {sku}')
            skipped += 1
            continue

        slug = PRODUCT_URLS.get(sku)
        if not slug:
            print(f'  SKIP (no URL): {sku}')
            failed += 1
            continue

        url = f'{BASE_URL}/product/{slug}/'
        print(f'  Fetching: {sku} from {slug[:40]}...')

        html = fetch_html(url)
        if not html:
            print(f'    FAILED: no HTML')
            failed += 1
            continue

        img_url = extract_product_image(html)
        if not img_url:
            print(f'    FAILED: no image found in HTML')
            failed += 1
            continue

        print(f'    Image URL: {img_url[:80]}...')

        if download_image(img_url, filepath):
            size = os.path.getsize(filepath)
            print(f'    OK: {size} bytes')

            # Update database with local path
            local_path = f'/images/products/{sku_lower}.jpg'
            c.execute('UPDATE ProductImage SET url = ? WHERE id = ?',
                      (local_path, img_id))
            success += 1
        else:
            print(f'    FAILED: download error')
            failed += 1

        # Small delay to be polite
        time.sleep(0.3)

    conn.commit()
    conn.close()

    print('\n' + '=' * 60)
    print(f'Summary: {success} downloaded, {skipped} skipped, {failed} failed')


if __name__ == '__main__':
    main()
