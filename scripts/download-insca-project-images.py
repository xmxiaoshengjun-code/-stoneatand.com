#!/usr/bin/env python3
"""
Download project images from INSCA website for all 8 projects.
Uses correct INSCA project page URLs (not slug-based).
Downloads images to public/images/projects/insca/ and updates SQLite DB.
"""

import sqlite3
import json
import os
import re
import urllib.request
import urllib.error
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / 'scripts' / 'qianfan-seed2.db'
IMG_DIR = BASE_DIR / 'public' / 'images' / 'projects' / 'insca'

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

# DB slug -> INSCA project page URL
PROJECT_URLS = {
    'pamesa-ceramica':      'https://insca.com/en/project/tile-showroom-refurbishment-Pamesa/',
    'natucer':              'https://insca.com/en/project/tile-showroom-design-natucer/',
    'geotiles-geoda':       'https://insca.com/en/project/showroom-geoda-display-tile-fixtures/',
    'porcelania':           'https://insca.com/en/project/tile-showroom-design-porcelania-spain/',
    'tilebar':              'https://insca.com/en/project/TileBar-Showroom-Washington-displays/',
    'sanipex-group':        'https://insca.com/en/project/ceramic-tile-showroom-display-sanipex/',
    'chafiras-san-miguel':  'https://insca.com/en/project/displays-for-building-materials-chafiras/',
    'comervia':             'https://insca.com/en/project/ceramic-and-bathroom-display-areas-comervia/',
}

def fetch_html(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f'  ERROR fetching {url}: {e}')
        return None

def extract_project_images(html):
    """Extract image URLs from /img/proyectos/ path."""
    urls = []
    seen = set()
    
    # Match all img src attributes containing /img/proyectos/
    pattern = r'<img[^>]+src="([^"]*img/proyectos/[^"]+)"'
    for match in re.finditer(pattern, html, re.IGNORECASE):
        url = match.group(1)
        if url not in seen:
            seen.add(url)
            urls.append(url)
    
    # Also check for background images
    bg_pattern = r'background-image:\s*url\(["\']?([^"\')]*img/proyectos/[^"\')]+)["\']?\)'
    for match in re.finditer(bg_pattern, html, re.IGNORECASE):
        url = match.group(1)
        if url not in seen:
            seen.add(url)
            urls.append(url)
    
    return urls

def download_image(url, dest_path):
    if dest_path.exists() and dest_path.stat().st_size > 5000:
        print(f'  [SKIP] {dest_path.name} (exists)')
        return True
    
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            if len(data) < 2000:
                print(f'  [WARN] Too small ({len(data)}B): {dest_path.name}')
                return False
            dest_path.write_bytes(data)
            print(f'  [OK] {dest_path.name} ({len(data)//1024}KB)')
            return True
    except Exception as e:
        print(f'  [FAIL] {dest_path.name}: {e}')
        return False

def main():
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    
    # Skip cleanup - new downloads will overwrite old files
    print('  (Skipping cleanup - will overwrite old files)')
    
    db = sqlite3.connect(str(DB_PATH))
    db.row_factory = sqlite3.Row
    
    all_project_images = {}
    
    for slug, insca_url in PROJECT_URLS.items():
        print(f'\n=== {slug} ===')
        print(f'  URL: {insca_url}')
        
        html = fetch_html(insca_url)
        if not html:
            continue
        
        img_urls = extract_project_images(html)
        print(f'  Found {len(img_urls)} project images')
        
        local_paths = []
        for i, img_url in enumerate(img_urls):
            # Determine extension
            clean_url = img_url.split('?')[0]
            ext = '.webp'
            for e in ['.webp', '.jpg', '.jpeg', '.png', '.gif', '.avif']:
                if clean_url.lower().endswith(e):
                    ext = e
                    break
            
            filename = f'{slug}-{i+1:02d}{ext}'
            dest = IMG_DIR / filename
            
            if download_image(img_url, dest):
                local_paths.append(f'/images/projects/insca/{filename}')
        
        # Keep existing hero image at the front
        row = db.execute('SELECT images FROM Project WHERE slug=?', (slug,)).fetchone()
        if row and row['images']:
            try:
                existing = json.loads(row['images'])
                if isinstance(existing, list):
                    for path in existing:
                        if path not in local_paths and '/images/projects/insca-' in path:
                            local_paths.insert(0, path)
                elif isinstance(existing, str) and '/images/projects/insca-' in existing:
                    if existing not in local_paths:
                        local_paths.insert(0, existing)
            except:
                pass
        
        all_project_images[slug] = local_paths
        print(f'  Total: {len(local_paths)} images')
    
    # Update database
    print('\n=== Updating Database ===')
    for slug, paths in all_project_images.items():
        if not paths:
            continue
        json_str = json.dumps(paths)
        db.execute('UPDATE Project SET images=? WHERE slug=?', (json_str, slug))
        print(f'  {slug}: {len(paths)} images saved')
    
    db.commit()
    db.close()
    
    total = sum(len(v) for v in all_project_images.values())
    print(f'\n=== DONE: {total} images across {len(all_project_images)} projects ===')

if __name__ == '__main__':
    main()
