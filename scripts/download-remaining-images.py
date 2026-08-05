#!/usr/bin/env python3
"""
Download product images for the 47 newly imported products from chndisplay.net.
Extracts main product image from each product detail page and saves to public/images/products/.
"""
import subprocess
import os
import re
import time

IMG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'images', 'products')

# (sku, chndisplay_url) - same data as import script
PRODUCTS = [
    # Carpet
    ("DL028", "https://chndisplay.net/product/dl028/"),
    ("DL022", "https://chndisplay.net/product/dl022/"),
    ("DL007", "https://chndisplay.net/product/dl007/"),
    ("DR903", "https://chndisplay.net/product/dr903/"),
    ("DR902", "https://chndisplay.net/product/dr902/"),
    ("DR901", "https://chndisplay.net/product/dr901/"),
    ("DL020", "https://chndisplay.net/product/dl020/"),
    ("DL002", "https://chndisplay.net/product/dl002/"),
    ("DL001", "https://chndisplay.net/product/dl001/"),
    ("DF919", "https://chndisplay.net/product/df919/"),
    ("DF917", "https://chndisplay.net/product/df917/"),
    ("DF103", "https://chndisplay.net/product/df103/"),
    # Mosaic
    ("MT001-3", "https://chndisplay.net/product/__trashed-92/"),
    ("MJ002-1", "https://chndisplay.net/product/__trashed-91/"),
    ("MM062", "https://chndisplay.net/product/highly-adaptable-mosaic-display-rack-mm062/"),
    ("TM046-1", "https://chndisplay.net/product/exquisitely-structured-mosaic-display-rack-tm046-1/"),
    ("TM046-2", "https://chndisplay.net/product/stain-resistant-and-easy-to-maintain-mosaic-display-rack-tm046-2/"),
    ("MSK002-3", "https://chndisplay.net/product/daily-durable-mosaic-display-rack-msk002-3/"),
    ("MSK002-5", "https://chndisplay.net/product/conveniently-installable-mosaic-display-rack-msk002-5/"),
    ("MSK002-4", "https://chndisplay.net/product/simple-and-generous-mosaic-display-rack-msk002-4/"),
    ("MSK001-3", "https://chndisplay.net/product/highly-adaptable-mosaic-display-rack-msk001-3/"),
    ("MJ002-4", "https://chndisplay.net/product/classic-shaped-mosaic-display-rack-mj002-4/"),
    ("MT001-12", "https://chndisplay.net/product/lightweight-and-stable-mosaic-display-rack-mt001-12/"),
    ("MT001-13", "https://chndisplay.net/product/easy-to-clean-mosaic-display-rack-mt001-13/"),
    # Bathroom
    ("VS063", "https://chndisplay.net/product/vs063-2/"),
    ("VX021", "https://chndisplay.net/product/vx021/"),
    ("VY005", "https://chndisplay.net/product/vy005-2/"),
    ("VX011", "https://chndisplay.net/product/vx011/"),
    ("VX010", "https://chndisplay.net/product/vx010/"),
    ("VT001", "https://chndisplay.net/product/vt001/"),
    ("VS183", "https://chndisplay.net/product/vs183/"),
    ("VS185", "https://chndisplay.net/product/vs185/"),
    ("VH002", "https://chndisplay.net/product/vh002/"),
    ("VH001", "https://chndisplay.net/product/vh001/"),
    ("VD101", "https://chndisplay.net/product/vd101/"),
    ("VZ012", "https://chndisplay.net/product/vz012/"),
    # Painting
    ("FYJ04-1", "https://chndisplay.net/product/mosaic-sample-panel-units-turn-page-rack-tiles-fyj04-1/"),
    ("FYF002-1", "https://chndisplay.net/product/tile-floor-display-stand-with-page-flipping-function-fyf002-1/"),
    ("FYF001-2", "https://chndisplay.net/product/granite-stone-turning-stations-marble-tile-display-fyf001-2/"),
    ("FYF005-2", "https://chndisplay.net/product/custom-turn-page-showroom-for-hardwood-cabinet-flooring-fyf005-2/"),
    ("FYF001-4", "https://chndisplay.net/product/marble-page-flip-stone-stand-flip-tile-display-tile-display-fyf001-4/"),
    ("FYF001-14", "https://chndisplay.net/product/large-rotating-stone-display-stand-that-turns-on-its-side-fyf001-14/"),
    ("FYF004-4", "https://chndisplay.net/product/large-rotating-stone-display-stand-with-page-turning-function-fyf004-4/"),
    ("YH001-1", "https://chndisplay.net/product/rust-proof-metal-painting-display-rack-yh001-1/"),
    ("YH001-2", "https://chndisplay.net/product/mobile-painting-display-rack-with-locking-wheels-yh001-2/"),
    ("TM047-3", "https://chndisplay.net/product/stackable-painting-display-rack-for-efficient-storage-tm047-3-2/"),
    ("TM047-1", "https://chndisplay.net/product/multi-tiered-painting-display-rack-for-diverse-collections-tm047-1/"),
]

IMAGE_PATTERNS = [
    r'<img[^>]+data-src="(https?://[^"]+wp-content/uploads/[^"]+)"',
    r'<img[^>]+src="(https?://[^"]+wp-content/uploads/[^"]+)"',
    r'<img[^>]+data-large_image="(https?://[^"]+wp-content/uploads/[^"]+)"',
    r'data-src="(https?://[^"]+wp-content/uploads/[^"]+\.(?:jpg|jpeg|png|webp))"',
]


def download_image(sku, url):
    """Download main product image from chndisplay.net product page."""
    dest = os.path.join(IMG_DIR, f"{sku.lower()}.jpg")
    if os.path.exists(dest) and os.path.getsize(dest) > 5000:
        return "SKIP", "already exists"

    # Fetch the product page HTML
    try:
        result = subprocess.run(
            ['curl', '-sL', '--max-time', '15', '-A', 'Mozilla/5.0', url],
            capture_output=True, text=True, timeout=20
        )
        html = result.stdout
    except Exception as e:
        return "ERROR", f"fetch failed: {e}"

    if not html or len(html) < 500:
        return "ERROR", "empty page"

    # Extract image URL
    img_url = None
    for pattern in IMAGE_PATTERNS:
        matches = re.findall(pattern, html)
        if matches:
            # Filter out icons/logos - prefer larger images
            for m in matches:
                if any(skip in m.lower() for skip in ['logo', 'icon', 'favicon', 'banner', 'header']):
                    continue
                img_url = m
                break
            if not img_url and matches:
                img_url = matches[0]
            if img_url:
                break

    if not img_url:
        return "ERROR", "no image found in HTML"

    # Download the image
    try:
        result = subprocess.run(
            ['curl', '-sL', '--max-time', '15', '-o', dest, '-A', 'Mozilla/5.0', img_url],
            capture_output=True, timeout=20
        )
        if os.path.exists(dest) and os.path.getsize(dest) > 5000:
            return "OK", f"downloaded {os.path.getsize(dest)} bytes"
        else:
            return "ERROR", f"downloaded file too small or missing"
    except Exception as e:
        return "ERROR", f"download failed: {e}"


def main():
    os.makedirs(IMG_DIR, exist_ok=True)

    downloaded = 0
    skipped = 0
    errors = 0

    for i, (sku, url) in enumerate(PRODUCTS):
        status, msg = download_image(sku, url)
        if status == "OK":
            downloaded += 1
            print(f"  [{i+1}/{len(PRODUCTS)}] {sku}: {msg}")
        elif status == "SKIP":
            skipped += 1
            print(f"  [{i+1}/{len(PRODUCTS)}] {sku}: SKIP ({msg})")
        else:
            errors += 1
            print(f"  [{i+1}/{len(PRODUCTS)}] {sku}: ERROR ({msg})")

        # Small delay to be polite
        if i < len(PRODUCTS) - 1:
            time.sleep(0.3)

    print(f"\n{'='*50}")
    print(f"Total: {len(PRODUCTS)} | Downloaded: {downloaded} | Skipped: {skipped} | Errors: {errors}")
    print(f"Images in directory: {len(os.listdir(IMG_DIR))}")


if __name__ == '__main__':
    main()
