import urllib.request
import re
import json
import os
import sqlite3
import unicodedata
from datetime import datetime, timezone

projects = [
    ('https://insca.com/en/project/tile-showroom-refurbishment-Pamesa/', 'Pamesa Cerámica', '3000 m²'),
    ('https://insca.com/en/project/tile-showroom-design-natucer/', 'Natucer', '740 m²'),
    ('https://insca.com/en/project/showroom-geoda-display-tile-fixtures/', 'Geotiles Geoda', '1600 m²'),
    ('https://insca.com/en/project/tile-showroom-design-porcelania-spain/', 'Porcelánia', '500 m²'),
    ('https://insca.com/en/project/TileBar-Showroom-Washington-displays/', 'TileBar', '745 m²'),
    ('https://insca.com/en/project/ceramic-tile-showroom-display-sanipex/', 'Sanipex Group', '1117 m²'),
    ('https://insca.com/en/project/displays-for-building-materials-chafiras/', 'Chafiras San Miguel', '2500 m²'),
    ('https://insca.com/en/project/ceramic-and-bathroom-display-areas-comervia/', 'Comervia', '650 m²'),
]

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
out_dir = os.path.join(base_dir, 'public', 'images', 'projects')
os.makedirs(out_dir, exist_ok=True)

db_path = os.path.join(base_dir, 'scripts', 'qianfan-seed2.db')
print('DB path:', db_path)
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("DELETE FROM Project")
cur.execute("DELETE FROM sqlite_sequence WHERE name='Project'")
print('Cleared existing projects')

def make_slug(text):
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

for idx, (url, title, area) in enumerate(projects, 1):
    print(f'[{idx}/8] Processing {title} ...')
    try:
        with urllib.request.urlopen(url, timeout=45) as r:
            html = r.read().decode('utf-8', errors='ignore')
        imgs = re.findall(r'src="(https://insca\.com/img/proyectos/bloques/[^"]+)"', html)
        main_imgs = [i for i in imgs if '/galeria/' not in i]
        main_img = main_imgs[0] if main_imgs else (imgs[0] if imgs else None)
        if not main_img:
            print('  No image found')
            continue

        ext = os.path.splitext(main_img.split('?')[0])[1] or '.webp'
        if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            ext = '.webp'
        slug = make_slug(title)
        filename = f"insca-{slug}{ext}"
        local_path = os.path.join(out_dir, filename)

        if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
            print('  Image already exists:', filename)
        else:
            try:
                urllib.request.urlretrieve(main_img, local_path)
                print('  Downloaded', filename)
            except Exception as e:
                print('  Download failed:', e)
                local_path = None

        desc_match = re.search(r'<meta[^>]+name="description"[^>]+content="([^"]+)"', html)
        description = desc_match.group(1) if desc_match else f"Custom showroom project for {title} ({area})."
        description = re.sub(r'&\w+;|&#[0-9]+;', ' ', description)
        description = description[:300]

        location = 'Spain'
        if 'dubai' in description.lower():
            location = 'Dubai, UAE'
        elif 'washington' in description.lower():
            location = 'Washington, USA'
        elif 'tenerife' in description.lower():
            location = 'Tenerife, Spain'

        images = json.dumps([f'/images/projects/{filename}']) if local_path else '[]'
        date_str = datetime.now(timezone.utc).replace(day=idx).isoformat().replace('+00:00', 'Z')

        cur.execute("""
            INSERT INTO Project (title, slug, description, location, projectDate, images, isPublished, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (title, slug, description, location, date_str, images, 1, idx, date_str, date_str))
        print('  Inserted project id', cur.lastrowid)
    except Exception as e:
        print(f'  ERROR processing {title}:', e)
        import traceback
        traceback.print_exc()

conn.commit()
conn.close()
print('Done')
