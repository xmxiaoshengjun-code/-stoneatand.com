"""
Download missing CSS/JS assets that have query parameters,
and fix HTML to remove query parameters from asset URLs.
"""
import os
import re
import glob
import urllib.request

BASE_URL = "http://localhost:3003"
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static-site')

def fetch_url(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read()
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None

def download_asset(path):
    """Download an asset, stripping query parameters."""
    clean_path = path.split('?')[0]  # Remove query params
    url = f"{BASE_URL}{clean_path}"
    content = fetch_url(url)
    if content is None:
        return False
    
    file_path = os.path.join(STATIC_DIR, clean_path.lstrip('/'))
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'wb') as f:
        f.write(content)
    return True

def fix_html_file(filepath):
    """Remove query parameters from asset URLs in HTML."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix CSS URLs: /_next/static/css/app/layout.css?v=123 -> /_next/static/css/app/layout.css
    content = re.sub(r'(/_next/static/[^"\']+?)\?v=\d+', r'\1', content)
    
    # Fix JS URLs: /_next/static/chunks/webpack.js?v=123 -> /_next/static/chunks/webpack.js
    content = re.sub(r'(/_next/static/chunks/[^"\']+?)\?v=\d+', r'\1', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    print("=== Downloading missing CSS/JS assets ===")
    
    # Collect all unique asset paths from HTML files (without query params)
    asset_paths = set()
    html_files = glob.glob(os.path.join(STATIC_DIR, '**', '*.html'), recursive=True)
    
    for filepath in html_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all /_next/static/ references with query params
        for match in re.finditer(r'(/_next/static/[^"\']+?)\?v=\d+', content):
            asset_paths.add(match.group(1))
        
        # Also find /_next/static/ references without query params that might not exist
        for match in re.finditer(r'"(/_next/static/[^"]+)"', content):
            path = match.group(1)
            if not path.endswith('.html'):
                asset_paths.add(path)
    
    print(f"Found {len(asset_paths)} unique asset paths to download")
    
    # Download each asset
    downloaded = 0
    skipped = 0
    for path in sorted(asset_paths):
        file_path = os.path.join(STATIC_DIR, path.lstrip('/'))
        if os.path.exists(file_path):
            skipped += 1
            continue
        
        print(f"  Downloading: {path}")
        if download_asset(path):
            downloaded += 1
    
    print(f"\nDownloaded: {downloaded}, Already existed: {skipped}")
    
    # Fix HTML files to remove query parameters
    print("\n=== Fixing HTML files (removing query params) ===")
    fixed = 0
    for filepath in html_files:
        if fix_html_file(filepath):
            fixed += 1
    
    print(f"Fixed {fixed} HTML files")
    
    # Also check for CSS files in _next/static/css
    css_dir = os.path.join(STATIC_DIR, '_next', 'static', 'css')
    if os.path.isdir(css_dir):
        css_files = glob.glob(os.path.join(css_dir, '**', '*.css'), recursive=True)
        print(f"\nCSS files found: {len(css_files)}")
        for css in css_files:
            print(f"  {os.path.relpath(css, STATIC_DIR)}")
    else:
        print("\nNo CSS directory found!")
    
    # Final verification
    js_count = len(glob.glob(os.path.join(STATIC_DIR, '_next', 'static', '**', '*.js'), recursive=True))
    css_count = len(glob.glob(os.path.join(STATIC_DIR, '_next', 'static', '**', '*.css'), recursive=True))
    print(f"\nFinal assets: {js_count} JS files, {css_count} CSS files")
    
    print("\n=== Done! ===")

if __name__ == '__main__':
    main()
