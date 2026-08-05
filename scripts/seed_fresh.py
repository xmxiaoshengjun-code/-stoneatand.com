# -*- coding: utf-8 -*-
"""Seed script that creates a fresh writable DB with schema dumped from prisma/dev.db."""
import sqlite3
import bcrypt
import os
from datetime import datetime

SRC_DB = "prisma/dev.db"
DST_DB = "scripts/qianfan-seed2.db"

def now():
    return datetime.utcnow().isoformat() + "Z"

def main():
    # 1. Dump schema from source (read-only works)
    src = sqlite3.connect(SRC_DB)
    schema_sql = src.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    src.close()
    print(f"Dumped {len(schema_sql)} table definitions from source")

    # 2. Create fresh destination
    if os.path.exists(DST_DB):
        os.remove(DST_DB)
    dst = sqlite3.connect(DST_DB)
    dst.execute("PRAGMA foreign_keys = OFF")

    # 3. Apply schema
    for (sql,) in schema_sql:
        if sql:
            dst.execute(sql)
    print("Schema applied to fresh database")

    cur = dst.cursor()

    # === 1. Admin User ===
    pwd_hash = bcrypt.hashpw(b"admin123", bcrypt.gensalt(10)).decode("utf-8")
    cur.execute(
        'INSERT INTO "User" (email, name, password, role, createdAt, updatedAt) VALUES (?,?,?,?,?,?)',
        ("admin@tsianfan.com", "Admin", pwd_hash, "ADMIN", now(), now())
    )
    print("Admin user created: admin@tsianfan.com / admin123")

    # === 2. Regions ===
    regions = [
        ("global", "Global", "en", "+86-750-1234567", "sales@tsianfan.com", "UTC+8", 1),
        ("north-america", "North America", "en", "+1-888-555-0123", "us-sales@tsianfan.com", "UTC-5", 0),
        ("europe", "Europe", "en", "+44-20-7946-0958", "eu-sales@tsianfan.com", "UTC+1", 0),
        ("asia", "Asia Pacific", "en", "+86-750-1234567", "asia-sales@tsianfan.com", "UTC+8", 0),
    ]
    for r in regions:
        cur.execute(
            'INSERT INTO "Region" (code, name, defaultLanguage, phone, email, timezone, isDefault) VALUES (?,?,?,?,?,?,?)',
            r
        )
    print(f"{len(regions)} regions created")

    # === 3. Series ===
    series_data = [
        ("Wall Sliding Rack", "推拉架", "wall-sliding-rack", "CT", "Wall-mounted sliding display racks for large format tiles 800mm+. Adjustable panel configuration, suitable for 10-15mm thickness.", 1),
        ("Drawer Cabinet", "抽屉柜", "drawer-cabinet", "CC", "Drawer-style sample cabinets for wood flooring, small tiles, and stone samples. Ideal for 12-15mm thickness.", 2),
        ("Combination Frame", "组合架", "combination-frame", "CH", "Modular combination display wall system for showroom main walls. Freely combinable configurations.", 3),
        ("Page-turning Stand", "翻页架", "page-turning-stand", "CF", "Flip-page display stands similar to music stands. Suitable for medium format tiles with batch display capability.", 4),
        ("Reclining Frame", "斜躺架", "reclining-frame", "CX", "Large format tile reclining display frames simulating installation effects. CX2019/CX006 support ultra-thin 7-9.5mm panels.", 5),
        ("Simple Frame", "简易架", "simple-frame", "CE", "Single-piece sample display stands for showroom entrances or zone displays. Compact and versatile.", 6),
        ("Floor-standing Rack", "落地架", "floor-standing-rack", "CL", "Freestanding movable floor display racks for 20mm thick samples. Double-sided punched display.", 7),
    ]
    series_ids = {}
    for s in series_data:
        cur.execute(
            'INSERT INTO "Series" (name, nameCn, slug, prefix, description, sortOrder, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?)',
            (s[0], s[1], s[2], s[3], s[4], s[5], now(), now())
        )
        series_ids[s[2]] = cur.lastrowid
    print(f"{len(series_data)} series created")

    # === 4. Products (55 SKUs) ===
    products = [
        # Series 1: Wall Sliding Rack (CT + SG601) - 14 SKUs
        ("SG601", "wall-sliding-rack", "SG601 Dual-Size Full-Adjustable Sliding Rack", "Dual-size sliding rack with fully adjustable panels supporting 18 combination modes.", "4800×750×2550 / 7200×750×2550", "600×2400", "15mm", "2600×800×800 / 2600×800×1400", None, "Dual size, fully adjustable panels (18 combinations)", 1),
        ("CT011", "wall-sliding-rack", "CT011 Multi-Panel Sliding Rack", "Configurable 2-9 panel sliding rack for standard large format tiles.", "1250×1500×2700", "1200×2400", "15mm", "2750×1550×950", 9, "2~9 panels freely configurable", 1),
        ("CT923", "wall-sliding-rack", "CT923 Compact Sliding Rack", "Small sliding rack for 600×1200 tiles.", "850×710×1350", "600×1200", "15mm", "1380×880×900", None, "Small sliding rack", 0),
        ("CT2143", "wall-sliding-rack", "CT2143 Sliding Rack Variant", "CT011 size family with structural adjustments.", "1250×1500×2700", "1200×2400", "15mm", "2750×1550×950", None, "CT011 same size family, structural adjustment", 0),
        ("CT914", "wall-sliding-rack", "CT914 Square Tile Sliding Rack", "Sliding rack specialized for square format tiles.", "1900×1250×2700", "600×600", "12mm", "700×720×150", None, "Square tile specialized", 0),
        ("CT2151", "wall-sliding-rack", "CT2151 Long-Edge Display Rack", "Large format long-edge display sliding rack.", "2450×1250×2700", "1200×2400", "15mm", "2750×750×1150", None, "Large panel long-edge display", 0),
        ("CT2119", "wall-sliding-rack", "CT2119 Ultra-Wide Wall Rack", "Ultra-wide wall sliding rack for extra-wide displays.", "2750×750×2600", "1200×2400", "15mm", "2600×1250×740", None, "Ultra-wide wall", 0),
        ("CT635", "wall-sliding-rack", "CT635 Compact Square Rack", "Compact sliding rack for small square tiles.", "700×650×1400", "600×600", "12mm", "1450×710×550", None, "Compact, small square panels", 0),
        ("CT2169", "wall-sliding-rack", "CT2169 Long Strip Tile Rack", "Sliding rack for long strip format tiles.", "2400×710×1900", "600×1800", "15mm", "2450×750×420", None, "Long strip tiles", 0),
        ("CT608", "wall-sliding-rack", "CT608 Sliding Rack", "CT923 size family compact sliding rack.", "850×710×1350", "600×1200", "15mm", "1380×880×900", None, "CT923 same size family", 0),
        ("CT605", "wall-sliding-rack", "CT605 Sliding Rack", "CT011 specification family sliding rack.", "1250×1500×2700", "1200×2400", "15mm", "2750×1550×950", None, "CT011 specification family", 0),
        ("CT925", "wall-sliding-rack", "CT925 Ultra-Compact Rack", "Ultra-compact sliding rack with minimal packaging volume.", "613×600×1350", "600×1200", "12mm", "880×200×380", None, "Ultra-compact, smallest packaging volume", 0),
        ("CT602", "wall-sliding-rack", "CT602 Multi-Size Tile Rack", "Sliding rack supporting 800×800, 1000×1000, and 1200×1200 tiles.", "1510×580×1354", "800×800 / 1000×1000 / 1200×1200", "15mm", "1380×880×900", None, "Supports 800×800 / 1000×1000 / 1200×1200", 0),
        ("CT611", "wall-sliding-rack", "CT611 Thin Panel Sliding Rack", "Sliding rack adapted for thin 10mm panels.", "992×606×1520", "600×1200", "10mm", "1040×650×1660", None, "Thin panel compatible (10mm)", 0),

        # Series 2: Drawer Cabinet (CC) - 11 SKUs
        ("CC155", "drawer-cabinet", "CC155 Large Capacity Drawer Cabinet", "Large capacity drawer cabinet for wood flooring and small tiles.", "2400×650×2100", "500×500", "12mm", "2500×2150×900", None, "Large capacity, wood flooring/small tiles universal", 1),
        ("CC2006", "drawer-cabinet", "CC2006 Low Profile Drawer Cabinet", "Low profile drawer cabinet for under-counter placement.", "2400×650×650", "600×600", "12mm", "2450×650×750", None, "Low profile, under-counter placement", 0),
        ("CC2075", "drawer-cabinet", "CC2075 Multi-Drawer Cabinet", "Medium cabinet with multi-compartment drawers.", "2480×850×800", "600×1200", "12mm", "2550×900×1050", None, "Medium cabinet, multi-compartment drawers", 0),
        ("CC2040", "drawer-cabinet", "CC2040 Compact Drawer Cabinet", "Compact drawer cabinet for 600×800 tiles.", "2300×700×750", "600×800", "12mm", "2350×750×900", None, "Compact type", 0),
        ("CC918", "drawer-cabinet", "CC918 Tall Slim Drawer Cabinet", "Tall slim cabinet with 7 drawer size combinations.", "1065×560×2260", "300×600", "12mm", "1250×690×550", None, "Tall slim, 7 drawer size combinations", 1),
        ("CC608", "drawer-cabinet", "CC608 Large Panel Drawer Cabinet", "Large panel compatible cabinet with drawer storage.", "2550×750×2600", "1200×2400", "15mm", "2600×1250×740", None, "Large panel compatible + drawers", 0),
        ("CC902", "drawer-cabinet", "CC902 Medium Single Cabinet", "Medium single drawer cabinet for 600×1200 tiles.", "1250×650×800", "600×1200", "15mm", "1300×700×950", None, "Medium single cabinet", 0),
        ("CC010", "drawer-cabinet", "CC010 Drawer Cabinet", "CC902 size family drawer cabinet.", "1250×650×800", "600×1200", "15mm", "1300×700×950", None, "CC902 same size family", 0),
        ("CC012", "drawer-cabinet", "CC012 Rounded Corner Cabinet", "Rounded corner compact drawer cabinet.", "1454×628×900", "560×1360", "12mm", "1520×740×980", None, "Rounded corner compact cabinet", 0),
        ("CC2064", "drawer-cabinet", "CC2064 Custom Size Cabinet", "Drawer cabinet with fully customizable sample sizes.", "850×580×870", "Custom", "*", "900×630×920", None, "Sample size fully customizable", 0),
        ("CC2061", "drawer-cabinet", "CC2061 Custom Size Cabinet", "Drawer cabinet with fully customizable sample sizes.", "850×590×840", "Custom", "*", "900×630×920", None, "Sample size fully customizable", 0),

        # Series 3: Combination Frame (CH) - 6 SKUs
        ("CH905", "combination-frame", "CH905 Small Tile Combination Frame", "Combination frame for small tile display.", "2400×650×800", "600×600", "12mm", "1290×1400×840", None, "Small tile combination display", 1),
        ("CH8053", "combination-frame", "CH8053 Combination Frame", "Combination frame with 750mm panel packaging.", "1500×700×800", "600×1200", "750mm", "1550×750×950", None, "Package includes 750mm panel", 0),
        ("CH2110", "combination-frame", "CH2110 Combination Frame", "CH905 size family combination frame.", "2400×650×800", "600×600", "12mm", "2450×690×950", None, "CH905 same size family", 0),
        ("CH2039", "combination-frame", "CH2039 Large Wall Combination Frame", "Large wall combination frame system.", "2400×700×800", "—", "15mm", "2450×750×950", None, "Large wall combination", 0),
        ("CH2111", "combination-frame", "CH2111 Compact Combination Frame", "CH905 compact version combination frame.", "850×590×840", "600×600", "12mm", "1290×1400×840", None, "CH905 compact version", 0),
        ("CH959", "combination-frame", "CH959 Multi-Size Combination Frame", "Combination frame supporting 300×600, 600×600, and 600×1200 tiles.", "1500×700×800", "300×600 / 600×600 / 600×1200", "750mm", "1550×750×950", None, "Supports 300×600 / 600×600 / 600×1200", 1),

        # Series 4: Page-turning Stand (CF) - 8 SKUs
        ("CF005", "page-turning-stand", "CF005 Medium Panel Flip Stand", "Flip-page display stand for medium format tiles.", "1500×500×1850", "600×1200", "12mm", "1750×510×620", None, "Medium panel flip", 1),
        ("CF2025", "page-turning-stand", "CF2025 Ultra-Large Panel Flip Stand", "Ultra-large panel flip stand for 3200mm tiles.", "3210×2860×1738", "1200×3200", "15mm", "3250×2040×950", None, "Ultra-large panel 3200mm", 1),
        ("CF008", "page-turning-stand", "CF008 Long Strip Flip Stand", "Flip stand for long strip format tiles.", "1750×650×2100", "600×1800", "15mm", "1900×660×850", None, "Long strip tile flip", 0),
        ("CF085", "page-turning-stand", "CF085 Square Panel Flip Stand", "Flip stand for square format tiles.", "1800×650×2100", "600×600", "15mm", "1900×660×850", None, "Square panel flip", 0),
        ("CF098", "page-turning-stand", "CF098 Small Panel Flip Stand", "Flip stand for small format tiles.", "1500×500×1850", "600×600", "12mm", "1750×510×620", None, "Small panel flip", 0),
        ("CF113", "page-turning-stand", "CF113 Double-Sided Flip Stand", "Double-sided flip display stand.", "900×900×2400", "600×600", "12mm", "2450×950×350", None, "Double-sided flip", 0),
        ("CF009", "page-turning-stand", "CF009 Flip Stand", "CF008 size family flip stand.", "1800×650×2100", "600×1800", "15mm", "1900×660×850", None, "CF008 same size family", 0),
        ("CF013", "page-turning-stand", "CF013 Ultra-Thin Pack Flip Stand", "Flip stand with ultra-thin 160mm packaging.", "1500×500×1600", "600×1200", "12mm", "1540×520×160", None, "Ultra-thin packaging (160mm)", 0),

        # Series 5: Reclining Frame (CX) - 4 SKUs
        ("CX2019", "reclining-frame", "CX2019 Ultra-Thin Panel Reclining Frame", "Reclining frame specialized for ultra-thin 7-9.5mm panels.", "1320×1374×1947", "600×1200", "7~9.5mm", "1840×1350×480", None, "Ultra-thin panel specialized", 1),
        ("CX2037", "reclining-frame", "CX2037 Standard Reclining Frame", "Standard large panel reclining display frame.", "2100×1380×1500", "600×1200", "15mm", "1450×1380×680", None, "Standard large panel reclining", 0),
        ("CX2021", "reclining-frame", "CX2021 Tall Reclining Frame", "CX2037 tall version reclining frame.", "2100×1380×1900", "600×1200", "15mm", "1850×1380×680", None, "CX2037 tall version", 0),
        ("CX006", "reclining-frame", "CX006 Large Format Ultra-Thin Reclining Frame", "Large format reclining frame for ultra-thin panels.", "2520×1374×1947", "1200×1200", "7~9.5mm", "1320×1250×1100", None, "Large format + ultra-thin panel", 1),

        # Series 6: Simple Frame (CE) - 10 SKUs
        ("CE014", "simple-frame", "CE014 Mini Sample Stand", "Mini sample display stand for 200×200 tiles.", "450×400×650", "200×200", "10mm", "680×460×430", None, "Mini sample", 0),
        ("CE089", "simple-frame", "CE089 Small Square Panel Stand", "Small square panel single display stand.", "620×450×600", "600×600", "12mm", "630×470×630", None, "Small square panel single display", 0),
        ("CE984", "simple-frame", "CE984 Simple Frame", "CE089 same structure simple frame.", "620×450×600", "600×600", "12mm", "630×470×630", None, "CE089 same structure", 0),
        ("CE965", "simple-frame", "CE965 Desktop Display Stand", "Desktop-level display stand at 36mm height.", "450×650×36", "600×600", "15mm", "680×460×70", None, "Desktop level (36mm)", 0),
        ("CE916", "simple-frame", "CE916 Minimal Sample Stand", "Smallest SKU in the catalog.", "180×450×80", "200×300", "12mm", "480×190×110", None, "Smallest SKU", 0),
        ("CE2126", "simple-frame", "CE2126 Long Strip Sample Stand", "Long strip sample display stand.", "400×800×520", "450×600", "15mm", "820×510×120", None, "Long strip sample display", 0),
        ("CE2127", "simple-frame", "CE2127 Tall Simple Frame", "Tall version simple frame stand.", "400×800×1200", "600×700", "15mm", "810×620×120", None, "Tall simple frame", 0),
        ("CE2138", "simple-frame", "CE2138 Flat-Pack Square Stand", "Large square panel stand with ultra-flat 50mm packaging.", "900×800×900", "600×600", "12mm", "910×810×50", None, "Large square panel, ultra-flat packaging (50mm)", 0),
        ("CE2139", "simple-frame", "CE2139 Flat-Pack Square Stand", "CE2138 size family flat-pack stand.", "900×800×900", "600×600", "12mm", "910×810×50", None, "CE2138 same size family", 0),
        ("CE095", "simple-frame", "CE095 Desktop Display Stand", "Desktop-level display stand, pairs with CE965.", "950×650×36", "600×600", "12mm", "980×660×70", None, "Desktop level (pairs with CE965)", 0),

        # Series 7: Floor-standing Rack (CL) - 2 SKUs
        ("CL210", "floor-standing-rack", "CL210 Floor-standing Display Rack", "Floor-standing rack for 20mm thick samples with double-sided display.", "1200×750×2100", "600×600", "20mm", "2250×1250×180", None, "20mm thick samples, double-sided punched", 1),
        ("CL213", "floor-standing-rack", "CL213 Tall Floor-standing Rack", "CL210 tall version floor-standing rack.", "1200×600×2400", "600×600", "20mm", "2450×1250×220", None, "CL210 tall version", 0),
    ]

    product_count = 0
    for p in products:
        sku, series_slug, name, desc, stand_size, panel_size, thickness, pkg_size, num_panel, features, is_featured = p
        series_id = series_ids.get(series_slug)
        if not series_id:
            print(f"WARN: Series not found for {sku}: {series_slug}")
            continue
        cur.execute(
            'INSERT INTO "Product" (sku, seriesId, name, description, standSize, panelSize, panelThickness, packageSize, numberOfPanel, features, material, isFeatured, isPublished, sortOrder, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            (sku, series_id, name, desc, stand_size, panel_size, thickness, pkg_size, num_panel, features,
             "Aluminum alloy + steel + MDF", is_featured, 1, product_count + 1, now(), now())
        )
        product_count += 1
    print(f"{product_count} products created")

    # === 5. FAQs ===
    faqs = [
        ("Product", "What tile sizes are compatible with Qianfan display racks?", "Our display racks support tile sizes ranging from 200×200mm to 1200×3200mm. Use our Spec Finder tool to match your tile dimensions with compatible display racks.", "tile size, compatibility, dimension, spec", 1),
        ("Product", "What tile thicknesses do your racks support?", "We support thicknesses from 7mm ultra-thin panels to 20mm thick slabs. The CX2019 and CX006 models are specifically designed for ultra-thin 7-9.5mm panels, while CL210 and CL213 accommodate 20mm thick samples.", "thickness, thin panel, thick, mm", 2),
        ("Product", "How many SKUs do you offer?", "We offer 55 SKUs across 7 product series, covering wall sliding racks, drawer cabinets, combination frames, page-turning stands, reclining frames, simple frames, and floor-standing racks.", "sku, model, count, how many", 3),
        ("Ordering", "What is the minimum order quantity (MOQ)?", "The MOQ varies by product. Please submit an inquiry through our contact form or WhatsApp, and our sales team will provide detailed MOQ and pricing information within 24 hours.", "moq, minimum order, quantity", 1),
        ("Ordering", "Can I customize the display rack dimensions?", "Yes, models like CC2064 and CC2061 offer fully customizable sample sizes. Contact our sales team with your specific requirements for custom solutions.", "customize, custom, dimension, size", 2),
        ("Shipping", "What are the packaging dimensions for shipping?", "Each product has specific packaging dimensions listed on its product page. Packaging ranges from ultra-flat (50mm thick) to standard sizes. Our team can help optimize container loading.", "packaging, shipping, container, freight", 1),
        ("Shipping", "Do you ship internationally?", "Yes, we export to over 6 countries across North America, Europe, and Asia. We can arrange FOB, CIF, or DDP shipping terms based on your preference.", "shipping, international, export, country", 2),
        ("Company", "How long has Qianfan been in business?", "Qianfan has 16 years of experience manufacturing tile display racks. We export 80% of our products to Europe and America, serving tile brands, distributors, and showroom designers worldwide.", "experience, history, years, company", 1),
        ("Company", "Where is Qianfan located?", "Qianfan is headquartered in China with a modern manufacturing facility. We serve global clients through our regional sales offices covering North America, Europe, and Asia Pacific.", "location, address, where, factory", 2),
    ]
    for f in faqs:
        cur.execute('INSERT INTO "FAQ" (category, question, answer, keywords, sortOrder) VALUES (?,?,?,?,?)', f)
    print(f"{len(faqs)} FAQs created")

    # === 6. Testimonials ===
    testimonials = [
        ("Michael Rodriguez", "Stone & Tile Co.", "United States", 5, "Qianfan's SG601 sliding rack transformed our showroom. The adjustable panels let us switch displays effortlessly, and the build quality is exceptional.", 1),
        ("Sophie Laurent", "Maison du Carrelage", "France", 5, "We ordered the CC918 tall cabinet for our boutique tile store. The 7-drawer configuration is perfect for organizing our small format samples. Highly recommended!", 2),
        ("Hans Müller", "Fliesen Gallery GmbH", "Germany", 5, "The CF2025 ultra-large flip stand handles our 3200mm slabs beautifully. Shipping was efficient and the flat-pack design saved us significant freight costs.", 3),
        ("David Chen", "Pacific Tile Distributors", "Canada", 5, "Excellent product quality and professional service. The CX2019 reclining frame perfectly displays our ultra-thin panels. Will order again.", 4),
        ("Giulia Rossi", "Ceramica Italia Showroom", "Italy", 5, "The combination frame system gave our showroom a modern, flexible look. The modular design allows us to reconfigure displays as needed. Fantastic product!", 5),
    ]
    for t in testimonials:
        cur.execute('INSERT INTO "Testimonial" (customerName, company, country, rating, content, isPublished, sortOrder, createdAt) VALUES (?,?,?,?,?,?,?,?)', (t[0], t[1], t[2], t[3], t[4], 1, t[5], now()))
    print(f"{len(testimonials)} testimonials created")

    # === 7. Banners ===
    banners = [
        ("Premium Tile Display Solutions", "16 years of craftsmanship. 55 SKUs across 7 series. Trusted by brands worldwide.", "/images/banners/hero-1.jpg", "/products", 1),
        ("Spec Finder Tool", "Enter your tile dimensions and find the perfect display rack in seconds.", "/images/banners/hero-2.jpg", "/spec-finder", 2),
        ("Global Export Expertise", "80% export to Europe and America. 6 countries covered. Reliable worldwide shipping.", "/images/banners/hero-3.jpg", "/about", 3),
    ]
    for b in banners:
        cur.execute('INSERT INTO "Banner" (title, subtitle, image, link, sortOrder, isPublished, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?)', (b[0], b[1], b[2], b[3], b[4], 1, now(), now()))
    print(f"{len(banners)} banners created")

    # === 8. Content Pages ===
    about_content = "<h1>About Qianfan</h1><p>Founded with a vision to revolutionize tile display solutions, Qianfan has grown over 16 years into a leading manufacturer of premium tile display racks. With 55 SKUs across 7 product series, we serve tile brands, distributors, and showroom designers in over 6 countries worldwide.</p><p>Our commitment to quality craftsmanship, innovative design, and customer satisfaction has earned us the trust of leading tile companies across North America, Europe, and Asia. 80% of our products are exported, meeting the demanding standards of international markets.</p><h2>Our Mission</h2><p>To provide the world's best tile display solutions that help our clients showcase their products beautifully and efficiently.</p><h2>Our Values</h2><ul><li>Quality first - every product meets international standards</li><li>Innovation driven - continuous improvement in design and manufacturing</li><li>Customer focused - tailored solutions for every client's needs</li><li>Global perspective - understanding diverse market requirements</li></ul>"
    contact_content = "<h1>Get in Touch</h1><p>Ready to elevate your tile showroom? Contact our team for product inquiries, custom solutions, or partnership opportunities.</p><h2>Headquarters</h2><p>Qianfan Display Solutions<br>Foshan, Guangdong, China<br>Phone: +86-750-1234567<br>Email: sales@tsianfan.com</p><h2>Regional Offices</h2><p><strong>North America:</strong> +1-888-555-0123 | us-sales@tsianfan.com</p><p><strong>Europe:</strong> +44-20-7946-0958 | eu-sales@tsianfan.com</p><p><strong>Asia Pacific:</strong> +86-750-1234567 | asia-sales@tsianfan.com</p><h2>Business Hours</h2><p>Monday - Friday: 9:00 AM - 6:00 PM (UTC+8)</p>"
    content_pages = [
        ("about", "About Us", about_content, "About Qianfan - 16 Years of Tile Display Excellence", "Learn about Qianfan, a leading manufacturer of premium tile display racks with 16 years of experience, serving clients in over 6 countries worldwide."),
        ("contact", "Contact Us", contact_content, "Contact Qianfan - Tile Display Solutions", "Contact Qianfan for tile display rack inquiries, custom solutions, and partnership opportunities. Regional offices in North America, Europe, and Asia."),
    ]
    for c in content_pages:
        cur.execute('INSERT INTO "ContentPage" (slug, title, content, metaTitle, metaDescription, updatedAt) VALUES (?,?,?,?,?,?)', (c[0], c[1], c[2], c[3], c[4], now()))
    print(f"{len(content_pages)} content pages created")

    # === 9. Sample Projects ===
    projects = [
        ("Premium Tile Showroom - Munich", "premium-tile-showroom-munich", "Complete showroom display solution for a leading German tile distributor.", "Qianfan supplied a comprehensive display system featuring SG601 sliding racks and CC918 drawer cabinets for a 500sqm showroom in Munich. The project included 25 display units across 4 product series, creating an immersive customer experience.", "Munich, Germany", "2025-03-15T00:00:00", 1),
        ("Boutique Tile Store - Milan", "boutique-tile-store-milan", "Elegant display solution for an Italian boutique tile retailer.", "A custom display solution featuring CX2019 reclining frames and CH959 combination frames for a premium boutique tile store in Milan. The project emphasized ultra-thin panel display capabilities.", "Milan, Italy", "2025-01-20T00:00:00", 2),
        ("Large Format Slab Gallery - Toronto", "large-format-slab-gallery-toronto", "Ultra-large panel display installation for a Canadian slab gallery.", "Installation of CF2025 ultra-large flip stands and CT011 sliding racks for a specialized large format slab gallery in Toronto. The 3200mm panel display capability was a key requirement.", "Toronto, Canada", "2024-11-10T00:00:00", 3),
    ]
    for p in projects:
        cur.execute('INSERT INTO "Project" (title, slug, description, content, location, projectDate, images, isPublished, sortOrder, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)', (p[0], p[1], p[2], p[3], p[4], p[5], "[]", 1, p[6], now(), now()))
    print(f"{len(projects)} projects created")

    dst.commit()
    dst.close()
    print("\n🎉 Seed completed successfully!")
    print("   Admin login: admin@tsianfan.com / admin123")

if __name__ == "__main__":
    main()
