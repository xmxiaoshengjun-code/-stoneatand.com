"""
Post-process the mirrored static site:
1. Replace Next.js image optimization URLs with direct image paths
2. Fix any other issues for static serving
"""
import os
import re
import urllib.parse
import glob

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static-site')

def fix_image_urls(html):
    """Replace /_next/image?url=%2Fimages%2F...&w=...&q=... with /images/..."""
    # Pattern: /_next/image?url=%2Fimages%2Fxxx.jpg&w=3840&q=75
    # or: /_next/image?url=/images/xxx.jpg&w=3840&q=75
    def replace_image_url(match):
        full_match = match.group(0)
        # Extract the url parameter
        url_match = re.search(r'url=([^&]+)', full_match)
        if url_match:
            encoded_url = url_match.group(1)
            decoded_url = urllib.parse.unquote(encoded_url)
            # Only replace if it's a local image path
            if decoded_url.startswith('/images/') or decoded_url.startswith('/_next/static/'):
                return decoded_url
        return full_match
    
    # Replace /_next/image?url=... patterns
    html = re.sub(r'/_next/image\?[^"\'<>\s]+', replace_image_url, html)
    
    return html

def fix_static_paths(html):
    """Ensure static asset paths are correct for static hosting."""
    # Next.js dev server might use /_next/static/ paths which should work as-is
    # in the static site since we downloaded the _next/static/ files
    return html

def process_file(filepath):
    """Process a single HTML file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return False
    
    original = content
    content = fix_image_urls(content)
    content = fix_static_paths(content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    print("=== Post-processing static site ===")
    print(f"Directory: {STATIC_DIR}")
    
    # Find all HTML files
    html_files = glob.glob(os.path.join(STATIC_DIR, '**', '*.html'), recursive=True)
    print(f"Found {len(html_files)} HTML files")
    
    fixed = 0
    for filepath in html_files:
        if process_file(filepath):
            fixed += 1
    
    print(f"Fixed image URLs in {fixed} files")
    
    # Verify the static site structure
    print("\n=== Static site structure ===")
    top_level = os.listdir(STATIC_DIR)
    print(f"Top-level items: {top_level}")
    
    # Check if index.html exists
    index_path = os.path.join(STATIC_DIR, 'index.html')
    if os.path.exists(index_path):
        print("Root index.html: EXISTS")
    else:
        print("Root index.html: MISSING!")
    
    # Check en/index.html
    en_index = os.path.join(STATIC_DIR, 'en', 'index.html')
    if os.path.exists(en_index):
        print("en/index.html: EXISTS")
    else:
        print("en/index.html: MISSING!")
    
    # Check _next/static
    next_static = os.path.join(STATIC_DIR, '_next', 'static')
    if os.path.isdir(next_static):
        css_count = len(glob.glob(os.path.join(next_static, '**', '*.css'), recursive=True))
        js_count = len(glob.glob(os.path.join(next_static, '**', '*.js'), recursive=True))
        print(f"_next/static: {css_count} CSS files, {js_count} JS files")
    else:
        print("_next/static: MISSING!")
    
    # Check images
    images_dir = os.path.join(STATIC_DIR, 'images')
    if os.path.isdir(images_dir):
        img_count = len(glob.glob(os.path.join(images_dir, '**', '*'), recursive=True))
        print(f"images/: {img_count} files")
    else:
        print("images/: MISSING!")
    
    print("\n=== Done! ===")

if __name__ == '__main__':
    main()
