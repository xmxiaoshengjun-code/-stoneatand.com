"""
Mirror the Next.js dev server to a static site directory.
Fetches all English-locale pages and static assets.
"""
import os
import sys
import urllib.request
import urllib.error
import sqlite3
import re
from html.parser import HTMLParser
import time

BASE_URL = "http://localhost:3003"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static-site")
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts", "qianfan-seed2.db")

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

class AssetExtractor(HTMLParser):
    """Extract asset URLs from HTML."""
    def __init__(self):
        super().__init__()
        self.assets = set()
        self.links = set()
    
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'link' and 'href' in attrs_dict:
            href = attrs_dict['href']
            if href.startswith('/_next/') or href.startswith('/images/'):
                self.assets.add(href)
        elif tag == 'script' and 'src' in attrs_dict:
            src = attrs_dict['src']
            if src.startswith('/_next/') or src.startswith('/images/'):
                self.assets.add(src)
        elif tag == 'img' and 'src' in attrs_dict:
            src = attrs_dict['src']
            if src.startswith('/_next/') or src.startswith('/images/'):
                self.assets.add(src)
        elif tag == 'a' and 'href' in attrs_dict:
            href = attrs_dict['href']
            if href.startswith('/en/') or href == '/en':
                self.links.add(href)

def fetch_url(url, timeout=30):
    """Fetch URL content."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read(), resp.getheader('content-type', '')
    except urllib.error.HTTPError as e:
        print(f"  HTTP Error {e.code}: {url}")
        return None, ''
    except Exception as e:
        print(f"  Error: {url} - {e}")
        return None, ''

def save_file(path, content):
    """Save content to file, creating directories as needed."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if isinstance(content, str):
        content = content.encode('utf-8')
    with open(path, 'wb') as f:
        f.write(content)

def mirror_page(path):
    """Fetch and save a page, return extracted assets and links."""
    url = f"{BASE_URL}{path}"
    print(f"  Fetching: {path}")
    content, ctype = fetch_url(url)
    if content is None:
        return set(), set()
    
    # Determine file path
    if path.endswith('/'):
        file_path = os.path.join(OUTPUT_DIR, path[1:], 'index.html')
    else:
        file_path = os.path.join(OUTPUT_DIR, path[1:])
        if not file_path.endswith('.html'):
            file_path = os.path.join(file_path, 'index.html')
    
    save_file(file_path, content)
    
    # Extract assets and links
    assets = set()
    links = set()
    try:
        parser = AssetExtractor()
        parser.feed(content.decode('utf-8', errors='replace'))
        assets = parser.assets
        links = parser.links
    except Exception as e:
        print(f"  Parse error: {e}")
    
    return assets, links

def mirror_asset(path):
    """Fetch and save a static asset."""
    # Skip Next.js image optimization URLs and other dynamic URLs with query params
    if '?' in path or path.startswith('/_next/image'):
        return False
    
    # Skip URLs that are too long or have invalid characters for Windows paths
    if len(path) > 200:
        return False
    
    url = f"{BASE_URL}{path}"
    content, ctype = fetch_url(url, timeout=15)
    if content is None:
        return False
    
    file_path = os.path.join(OUTPUT_DIR, path[1:])
    try:
        save_file(file_path, content)
        return True
    except (OSError, ValueError) as e:
        print(f"  Skip asset (path error): {path}")
        return False

def get_product_skus():
    """Get all product SKUs from database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute("SELECT LOWER(sku) FROM Product")
    skus = [row[0] for row in cursor.fetchall()]
    conn.close()
    return skus

def get_project_slugs():
    """Get all project slugs from database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute("SELECT slug FROM Project")
    slugs = [row[0] for row in cursor.fetchall()]
    conn.close()
    return slugs

def main():
    print("=== Static Site Mirror ===")
    
    # Collect all page paths to fetch
    pages = set()
    
    # Core pages
    core_pages = [
        '/en',
        '/en/products',
        '/en/about',
        '/en/contact',
        '/en/projects',
        '/en/faq',
        '/admin/login',
    ]
    pages.update(core_pages)
    
    # Product detail pages
    print("Getting product SKUs...")
    skus = get_product_skus()
    print(f"  Found {len(skus)} products")
    for sku in skus:
        pages.add(f'/en/products/{sku}')
    
    # Project detail pages
    print("Getting project slugs...")
    slugs = get_project_slugs()
    print(f"  Found {len(slugs)} projects")
    for slug in slugs:
        pages.add(f'/en/projects/{slug}')
    
    # Fetch all pages
    print(f"\nFetching {len(pages)} pages...")
    all_assets = set()
    fetched = 0
    for page in sorted(pages):
        assets, links = mirror_page(page)
        all_assets.update(assets)
        fetched += 1
        if fetched % 20 == 0:
            print(f"  Progress: {fetched}/{len(pages)} pages")
    
    print(f"\nFetched {fetched} pages")
    print(f"Found {len(all_assets)} unique assets to download")
    
    # Fetch all assets
    print("\nDownloading assets...")
    asset_count = 0
    skipped = 0
    for asset in sorted(all_assets):
        if mirror_asset(asset):
            asset_count += 1
        else:
            skipped += 1
        if (asset_count + skipped) % 50 == 0:
            print(f"  Progress: {asset_count + skipped}/{len(all_assets)} (downloaded: {asset_count}, skipped: {skipped})")
    
    print(f"\nDownloaded {asset_count} assets, skipped {skipped} dynamic/skipped assets")
    
    # Create root index.html that redirects to /en/
    root_index = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>TSIANFAN - Display Rack Manufacturer</title>
<meta http-equiv="refresh" content="0; url=/en/">
<script>window.location.href = '/en/';</script>
</head>
<body>
<p>Redirecting to <a href="/en/">TSIANFAN</a>...</p>
</body>
</html>"""
    save_file(os.path.join(OUTPUT_DIR, 'index.html'), root_index)
    
    # Copy public directory
    print("\nCopying public directory...")
    public_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public')
    if os.path.isdir(public_dir):
        import shutil
        for item in os.listdir(public_dir):
            src = os.path.join(public_dir, item)
            dst = os.path.join(OUTPUT_DIR, item)
            if os.path.isdir(src):
                if not os.path.exists(dst):
                    shutil.copytree(src, dst, dirs_exist_ok=True)
            else:
                shutil.copy2(src, dst)
        print("  Public directory copied")
    
    print(f"\n=== Done! Static site saved to: {OUTPUT_DIR} ===")
    print(f"Total pages: {fetched}")
    print(f"Total assets: {asset_count}")

if __name__ == '__main__':
    main()
