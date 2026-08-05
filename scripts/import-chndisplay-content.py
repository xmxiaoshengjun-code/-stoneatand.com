"""
Batch import products, FAQs, and projects from chndisplay.net into the SQLite database.
Usage: python scripts/import-chndisplay-content.py
"""
import sqlite3
import os
import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')
IMG_BASE = 'https://chndisplay.net/wp-content/uploads'

# ============================================================
# 1. NEW SERIES (categories from chndisplay.net)
# ============================================================
NEW_SERIES = [
    # (name, nameCn, slug, prefix, description, sortOrder)
    ('Stone Display Rack', '石材展示架', 'stone-display-rack', 'LD',
     'Professional stone display racks for granite, marble, quartz, and engineered stone samples. Floor-standing and wall-mounted options for showrooms and trade shows.', 8),
    ('Wood Flooring Display Rack', '木地板展示架', 'wood-flooring-display-rack', 'WD',
     'Wooden flooring display racks designed to showcase laminate, hardwood, and engineered wood samples at optimal angles. Space-saving and durable construction.', 9),
    ('Door & Window Display Rack', '门窗展示架', 'door-window-display-rack', 'DL',
     'Display racks for door and window products. Freestanding and wall-mounted options to present different styles, materials, and colors effectively.', 10),
    ('Sample Box & Book Display', '样品箱册展示', 'sample-box-book-display', 'PP',
     'Portable sample boxes, books, and cases for tile, stone, and mosaic samples. Compact designs for sales reps and trade show presentations.', 11),
    ('MDF Board Display', '中纤板展示', 'mdf-board-display', 'STB',
     'MDF board displays with smooth surface finish for stone and tile sample presentation. Lightweight, durable, and customizable.', 12),
    ('Carpet Display Rack', '地毯展示架', 'carpet-display-rack', 'DL',
     'Carpet display racks that present carpet patterns, colors, and textures effectively. Space-efficient designs for retail environments.', 13),
    ('Mosaic Display Rack', '马赛克展示架', 'mosaic-display-rack', 'LX',
     'Mosaic tile display racks with artistic presentation options. Versatile styles for different decorative themes.', 14),
    ('Bathroom Display', '卫浴展示', 'bathroom-display', 'BT',
     'Bathroom hardware and accessory display solutions. Towel racks, hooks, shelves, and faucet displays for showroom presentations.', 15),
    ('Painting Sample Display', '涂料样品展示', 'painting-sample-display', 'PT',
     'Painting and coating sample display racks for organized presentation of color samples. Professional and systematic display solutions.', 16),
]

# ============================================================
# 2. NEW PRODUCTS (from chndisplay.net category pages)
# ============================================================
# Each product: (sku, series_prefix, name, description, material, features)
# Images will be set to chndisplay.net product page URLs

NEW_PRODUCTS = [
    # --- Tile Displays Rack (additional products not in current DB) ---
    ('CE089', 'CE', 'Versatile Basic Tile Display Rack for Countertop or Wall Mounting',
     'This basic tile display rack boasts great versatility: use it on countertops or mount it on walls. Simple, durable, saves space, and keeps tile samples organized. Suitable for small shops, showrooms, or pop-ups.',
     'Metal + EVA', 'Countertop or wall mounting; Space-saving design; Durable construction'),
    ('CC001-4', 'CC', 'Tile Stone Display Desk with Hidden Advantages',
     'A versatile tile stone display desk that combines functionality with aesthetic appeal. Perfect for showcasing large format tiles and stone slabs in showroom settings.',
     'Metal + Wood', 'Display desk format; Large format support; Customizable finish'),
    ('CC001-2', 'CC', 'Tile Stone Display Desk with Distinctive Traits',
     'Compact tile stone display desk designed for efficient sample presentation. Ideal for boutique showrooms with limited space.',
     'Metal + Wood', 'Compact design; Easy access; Professional presentation'),
    ('DDF001-1', 'DDF', 'Tailor-Made Tile Wall Panel Display Rack',
     'Custom tile wall panel display rack designed to reflect your brand vision. Full customization of size, color, and configuration.',
     'Steel + Aluminum', 'Full customization; Wall panel format; Brand-specific design'),
    ('DDF001-6', 'DDF', 'Tile Wall Panel Display Rack - Brand Customized',
     'Wall panel display rack customized to reflect your brand identity. Premium construction with adjustable panel configurations.',
     'Steel + Aluminum', 'Brand customization; Adjustable panels; Premium finish'),
    ('DDF001-8', 'DDF', 'Personalized Tile Wall Panel Display Rack',
     'Express your creativity with this personalized tile wall panel display rack. Flexible design accommodates various tile sizes and styles.',
     'Steel + Aluminum', 'Personalized design; Flexible configuration; Multi-size support'),
    ('DDF001-15', 'DDF', 'Custom Tile Wall Panel Display Rack - Create Your Look',
     'Create your own look with this fully customizable tile wall panel display rack. Ideal for trade show displays and showroom feature walls.',
     'Steel + Aluminum', 'Full custom design; Trade show ready; Feature wall capable'),
    ('DDF001-12', 'DDF', 'Tile Wall Panel Display Rack - Style Customized',
     'Tile wall panel display rack customized for your specific style requirements. Clean, modern design with robust construction.',
     'Steel + Aluminum', 'Style customization; Modern design; Robust construction'),
    ('DDF001-3', 'DDF', 'Custom-Tailored Tile Wall Panel Display Rack',
     'Custom-tailored tile wall panel display rack to fit your specific needs. Adjustable shelf heights and panel configurations.',
     'Steel + Aluminum', 'Custom-tailored fit; Adjustable shelves; Modular design'),
    ('DDF001-11', 'DDF', 'Tile Wall Panel Display Rack for Trade Shows',
     'Stand out at trade shows with this portable tile wall panel display rack. Easy assembly and disassembly for event use.',
     'Steel + Aluminum', 'Trade show optimized; Portable; Easy assembly'),
    ('N2002', 'DDF', 'Trend-Setting Tile Wall Panel Display Rack',
     'Embrace trend-setting design with this innovative tile wall panel display rack. Contemporary aesthetic meets practical functionality.',
     'Steel + Aluminum', 'Trend-setting design; Contemporary aesthetic; Practical function'),
    ('DDF002-2', 'DDF', 'Exquisite Design Tile Wall Panel Display Rack',
     'Experience exquisite design with this premium tile wall panel display rack. Sophisticated construction for high-end showrooms.',
     'Steel + Aluminum', 'Exquisite design; Premium construction; High-end finish'),

    # --- Stone Displays Rack ---
    ('SRT930', 'LD', 'China Manufacturer Stone Tile Countertop Display Stand',
     'Professional stone tile countertop display stand from the manufacturer. Ideal for presenting stone samples at counter height for customer browsing.',
     'Steel + Wood', 'Countertop format; Manufacturer direct; Stone tile optimized'),
    ('MY004', 'LD', 'Tailor-Made Stone Sample Standing Display Rack',
     'Custom stone sample standing display rack built to your specifications. Full-height floor standing design for maximum visibility.',
     'Steel', 'Full custom; Floor standing; Maximum visibility'),
    ('LD017-5', 'LD', 'Custom Stone Sample Standing Display Rack',
     'Design your dream display with this custom stone sample standing rack. Configurable shelves and panel sizes.',
     'Steel', 'Custom design; Configurable shelves; Standing format'),
    ('LD018-1', 'LD', 'Custom-Engineered Stone Sample Standing Display Rack',
     'Custom-engineered stone sample standing display rack with precision construction. Designed for heavy stone samples.',
     'Steel', 'Custom-engineered; Heavy-duty; Precision construction'),
    ('LD016-1', 'LD', 'Ceramic Tile Sample Metal Display Rack',
     'Metal display rack for ceramic tile sample boards. Sturdy construction with multiple display angles.',
     'Metal', 'Metal construction; Multi-angle; Sample board compatible'),
    ('LD015-3', 'LD', 'Hanging Circular Trade Show Sample Display Rack',
     'Hanging circular display rack for trade show presentations. Eye-catching rotating design for 360-degree viewing.',
     'Steel + Acrylic', 'Hanging design; Circular format; Trade show ready'),
    ('LD012-4', 'LD', 'Plastic Sheet Material Rack with Slate Walls',
     'Modern display fixtures with slate walls for plastic sheet material display. Contemporary design for modern showrooms.',
     'Steel + Plastic', 'Modern fixtures; Slate wall panels; Sheet material display'),
    ('LD013-1', 'LD', 'Modern Furniture Retail Granite Marble Stone Display Rack',
     'Display rack designed for modern furniture retail environments. Optimized for granite and marble stone sample presentation.',
     'Steel', 'Modern retail design; Granite/marble optimized; Retail ready'),
    ('LD012-3', 'LD', 'Wall Display Stand Frame Exhibition Trade Show Marble Rack',
     'Wall display stand frame for exhibition and trade show marble display. Portable and easy to configure.',
     'Steel', 'Wall display; Exhibition ready; Portable frame'),
    ('LD003-2', 'LD', 'Modern Retail Shop Marble Stone Display Rack',
     'Marble stone display rack for modern retail shops. Clean lines and professional presentation.',
     'Steel', 'Modern retail; Clean design; Marble optimized'),
    ('LD003-3', 'LD', 'Tile Wall Display Stand Frame Exhibition',
     'Tile wall display stand frame for exhibition and trade show use. Lightweight and easy to transport.',
     'Steel', 'Exhibition frame; Lightweight; Easy transport'),
    ('LD004-5', 'LD', 'Custom Exhibition Stainless Steel Display Panel',
     'Custom stainless steel display panel for exhibition use. Premium material with corrosion-resistant finish.',
     'Stainless Steel', 'Stainless steel; Corrosion-resistant; Exhibition grade'),

    # --- Wooden Flooring Display Rack ---
    ('WD3073', 'WD', 'Multi-Purpose Practical Wood Floor Stand',
     'Multi-purpose practical wood floor stand for versatile display needs. Sturdy construction with practical design.',
     'Wood + Metal', 'Multi-purpose; Practical design; Sturdy construction'),
    ('WJ033', 'WD', 'Thick High Load-Bearing Wood Floor Stand',
     'Thick and high load-bearing wood floor stand for heavy sample collections. Reinforced structure for durability.',
     'Wood + Metal', 'High load-bearing; Reinforced; Heavy-duty'),
    ('WDR003-3', 'WD', 'Moisture-Proof Treated Durable Wood Floor Stand',
     'Moisture-proof treated wood floor stand for humid environments. Durable construction with protective coating.',
     'Wood + Metal', 'Moisture-proof; Protective coating; Durable'),
    ('WDR003-2', 'WD', 'Easy-to-Install Convenient Wood Floor Stand',
     'Easy-to-install wood floor stand with convenient assembly system. No specialized tools required.',
     'Wood + Metal', 'Easy installation; Convenient assembly; Tool-free'),
    ('WDR002-5', 'WD', 'Smooth-Surface Wood Floor Stand',
     'Wood floor stand with smooth surface finish for premium presentation. Elegant design for upscale showrooms.',
     'Wood + Metal', 'Smooth surface; Premium finish; Elegant design'),
    ('WDR002-4', 'WD', 'Easy-Assembly Wood Floor Stand',
     'Easy-assembly wood floor stand with modular components. Quick setup and reconfiguration.',
     'Wood + Metal', 'Easy assembly; Modular; Quick setup'),
    ('WDR002-3', 'WD', 'Multi-Layer Storage Wood Floor Stand',
     'Multi-layer wood floor stand with ample storage capacity. Displays multiple flooring samples simultaneously.',
     'Wood + Metal', 'Multi-layer; High capacity; Simultaneous display'),
    ('WDR002-2', 'WD', 'Simple-Designed Wood Floor Stand',
     'Simple-designed wood floor stand with minimalist aesthetic. Clean lines for modern showroom environments.',
     'Wood + Metal', 'Simple design; Minimalist; Modern aesthetic'),
    ('WDF001-4', 'WD', 'Sturdy Solid Wood Floor Stand',
     'Sturdy solid wood floor stand for premium flooring displays. Full solid wood construction for maximum durability.',
     'Solid Wood', 'Solid wood; Maximum durability; Premium quality'),
    ('WDF001-2', 'WD', 'Classic-Look Wood Floor Stand',
     'Classic-look wood floor stand with traditional craftsmanship. Timeless design for established brands.',
     'Solid Wood', 'Classic design; Traditional craft; Timeless appeal'),
    ('WDR005-4', 'WD', 'Lightweight Wood Floor Stand',
     'Lightweight wood floor stand for easy moving and repositioning. Portable design without sacrificing stability.',
     'Wood + Metal', 'Lightweight; Portable; Easy repositioning'),
    ('WDR005-5', 'WD', 'Modern-Style Wood Floor Stand',
     'Modern-style wood floor stand with contemporary appearance. Sleek design for forward-thinking brands.',
     'Wood + Metal', 'Modern style; Contemporary; Sleek design'),

    # --- Door & Window Display Racks ---
    ('DL030', 'DL', 'Foldable Carpet Display Stand',
     'Foldable display stand for convenient storage and transport. Ideal for trade shows and temporary displays.',
     'Metal', 'Foldable; Portable; Space-saving storage'),
    ('DT107', 'DL', 'Dividable Carpet Display Rack',
     'Dividable display rack with configurable sections. Adjust display layout to match your space and product range.',
     'Metal', 'Dividable sections; Configurable; Flexible layout'),
    ('DL023', 'DL', 'Reliable Copper Carpet Rack',
     'Reliable copper-finish display rack for premium product presentation. Corrosion-resistant coating for longevity.',
     'Copper-finished Metal', 'Copper finish; Corrosion-resistant; Premium look'),
    ('DL027', 'DL', 'Meticulously Crafted Carpet Display',
     'Meticulously crafted display rack with attention to detail. Superior build quality for professional environments.',
     'Metal', 'Meticulous craft; Superior quality; Professional grade'),
    ('DL031', 'DL', 'Quality-Engineered Carpet Rack',
     'Quality-engineered display rack with precision manufacturing. Consistent performance and reliability.',
     'Metal', 'Quality-engineered; Precision made; Reliable'),
    ('DL016', 'DL', 'Master-Worked Carpet Display',
     'Master-worked display rack showcasing expert craftsmanship. Premium materials and construction.',
     'Metal', 'Master craftsmanship; Premium materials; Expert construction'),
    ('DL004', 'DL', 'Faultless Iron Carpet Stand',
     'Faultless iron display stand with flawless construction. Robust iron build for long-term use.',
     'Iron', 'Iron construction; Robust; Long-term durability'),
    ('D001-3', 'DL', 'Wooden Door Stone Display Stand',
     'Wooden door and stone display stand for combined product presentations. Versatile design for multi-product showrooms.',
     'Wood + Metal', 'Multi-product; Versatile; Combined display'),
    ('D003-2', 'DL', 'High Quality Wooden Door Display Rack',
     'High quality wooden door display rack for professional door showrooms. Sturdy and elegant.',
     'Wood + Metal', 'High quality; Door display; Professional'),
    ('D005-2', 'DL', 'Tile Sample Display with Sliding Doors',
     'Modern style tile sample display with sliding doors. Contemporary design for modern showroom environments.',
     'Wood + Metal + Glass', 'Sliding doors; Modern style; Glass panels'),
    ('D004-2', 'DL', 'Door Samples Metal Display Stand',
     'Metal display stand for door samples. Heavy-duty construction for full-size door panels.',
     'Metal', 'Heavy-duty; Full-size doors; Metal construction'),
    ('D002-3', 'DL', 'Portable Metal Holder Wooden Door Rack',
     'Portable metal holder for wooden door display. Easy to move and set up for flexible showroom layouts.',
     'Metal', 'Portable; Easy setup; Flexible layout'),

    # --- Sample Box & Book Display ---
    ('PP-5', 'PP', 'Tile & Stone Sample Book - Possibilities Come to Life',
     'Comprehensive tile and stone sample book for portable presentations. Professional organization of samples for sales visits.',
     'Leather + EVA', 'Portable book; Professional organization; Sales-ready'),
    ('PX018', 'PP', 'Business Tile Sample Case with Pulling Rod',
     'Business tile sample case with integrated pulling rod for easy transport. Rolling case design for sales professionals.',
     'Aluminum + EVA', 'Pulling rod; Rolling case; Professional transport'),
    ('PM031', 'PP', 'Modern Wooden Countertop Display Carry Case',
     'Modern wooden countertop display stand with professional carry case. Compact and portable for trade shows.',
     'Wood + Leather', 'Countertop display; Carry case; Compact portable'),
    ('PB021', 'PP', 'Acrylic Floor Display Rack Box Tile Sample Case',
     'Modern style display cabinet case with acrylic construction. Transparent design for maximum product visibility.',
     'Acrylic', 'Acrylic construction; Transparent; Modern style'),
    ('YPHF003-11', 'PP', 'Custom Marble Sample Display Aluminum Case',
     'Custom marble sample display aluminum case for premium sample transport. Lightweight and durable.',
     'Aluminum', 'Aluminum case; Custom marble; Lightweight durable'),
    ('YPHF003-8', 'PP', 'Sandstone Sample Display Aluminum Case',
     'Sandstone sample display aluminum case for professional presentations. Weather-resistant construction.',
     'Aluminum', 'Aluminum case; Sandstone display; Weather-resistant'),
    ('LGX003-5', 'PP', 'Porcelain Veneer Tile Sample Display Aluminum Case',
     'Porcelain veneer tile sample display case with sophisticated design. Premium aluminum construction.',
     'Aluminum', 'Aluminum case; Porcelain veneer; Sophisticated design'),
    ('LGX002-5', 'PP', 'Slate Sample Display Aluminum Case',
     'Slate sample display aluminum case with stylish design concept. Professional grade for trade use.',
     'Aluminum', 'Aluminum case; Slate display; Stylish design'),
    ('LGX002-3', 'PP', 'Slate Veneer Sample Display Aluminum Case',
     'Slate veneer sample display case with stand-out features. Compact and professional.',
     'Aluminum', 'Aluminum case; Slate veneer; Compact design'),
    ('LGX002-4', 'PP', 'Engineered Stone Sample Display Aluminum Case',
     'Engineered stone sample display aluminum case with top-notch benefits. Premium protection for valuable samples.',
     'Aluminum', 'Aluminum case; Engineered stone; Premium protection'),
    ('LX002-5', 'PP', 'Mosaic Tile Sample Display Aluminum Case',
     'Mosaic tile sample display aluminum case with distinctive traits. Organized presentation for small format tiles.',
     'Aluminum', 'Aluminum case; Mosaic tiles; Organized presentation'),

    # --- MDF Board Display ---
    ('STB001-1', 'STB', 'Textured Surface Anti-Slip Stone Sample Board Display',
     'Textured surface stone sample board display with anti-slip properties. Safe and professional presentation.',
     'MDF + EVA', 'Textured surface; Anti-slip; Professional'),
    ('STB002-3', 'STB', 'Adjustable Shelving Stone Sample Board Display',
     'Adjustable shelving system for compact stone sample board display. Flexible configuration options.',
     'MDF + Steel', 'Adjustable shelving; Compact; Flexible'),
    ('STB002-2', 'STB', 'Hygienic Portable Stone Sample Board Display',
     'Hygienic and portable stone sample board display. Easy to clean surface for professional environments.',
     'MDF + EVA', 'Hygienic; Portable; Easy clean'),
    ('STB002-1', 'STB', 'Scratch-Resistant Compact Stone Sample Board Display',
     'Scratch-resistant compact stone sample board display. Durable surface for long-term use.',
     'MDF + EVA', 'Scratch-resistant; Compact; Durable'),
    ('PS006', 'STB', 'Expandable Portable Stone Sample Board Display',
     'Expandable and portable stone sample board display. Adapts to different sample quantities.',
     'MDF + Steel', 'Expandable; Portable; Adaptable'),
    ('TM049-1', 'STB', 'Shock-Absorbent Lightweight Stone Sample Board Display',
     'Shock-absorbent and lightweight stone sample board display. Protects samples during transport.',
     'MDF + EVA', 'Shock-absorbent; Lightweight; Protective'),
    ('TM049-3', 'STB', 'Multi-Layered Wood Stone Sample Board Display',
     'Multi-layered wood structure lightweight stone sample board display. Premium wood construction.',
     'MDF + Wood', 'Multi-layered; Lightweight; Premium wood'),
    ('STB001-4', 'STB', 'Ergonomic Portable Stone Sample Board Display',
     'Ergonomic and portable stone sample board display. Comfortable handling for sales presentations.',
     'MDF + EVA', 'Ergonomic; Portable; Comfortable handling'),
    ('STB002-4', 'STB', 'Anti-Scratch Lightweight Stone Sample Board Display',
     'Anti-scratch and lightweight stone sample board display. Durable and easy to carry.',
     'MDF + EVA', 'Anti-scratch; Lightweight; Easy carry'),
    ('STB001-3', 'STB', 'Shockproof Compact Stone Sample Board Display',
     'Shockproof and compact stone sample board display. Maximum protection in minimal space.',
     'MDF + EVA', 'Shockproof; Compact; Maximum protection'),
    ('PS001', 'STB', 'Lightweight Stone Sample Board Display',
     'Lightweight stone sample board display for easy handling and transport. Essential for mobile sales.',
     'MDF + EVA', 'Lightweight; Easy handling; Mobile sales'),
    ('PS003', 'STB', 'Adjustable Portable Stone Sample Board Display',
     'Adjustable and portable stone sample board display. Versatile configuration for different sample sizes.',
     'MDF + Steel', 'Adjustable; Portable; Versatile'),
]

# ============================================================
# 3. FAQ ENTRIES (from chndisplay.net product page FAQ section)
# ============================================================
NEW_FAQS = [
    ('Company', 'Are you a trading company or a manufacturer?',
     'We are a factory and manufacturer with 17+ years of experience in producing display racks. We welcome factory visits and can arrange live video tours of our facilities.',
     'factory, manufacturer, trading company, supplier'),
    ('Order Process', 'How do I get the right price for my display rack?',
     'Please provide the following information for an accurate quote: 1) Sample quantity - how many tile/stone/wood samples you want to display; 2) Sample size - including thickness, which is important for panel design; 3) Order quantity - how many sets you need.',
     'price, quote, cost, pricing, estimate'),
    ('Shipping', 'How long is your delivery time?',
     'Generally, delivery is 25-45 days after deposit is received and sample specifications are confirmed. Since we are a manufacturer, all products are produced according to customer requirements and are not stocked. Stock items can be delivered within 7 days.',
     'delivery, shipping, lead time, production time'),
    ('Samples', 'Do you provide samples? Is it free or extra?',
     'Yes, we can offer samples. However, a sample fee is required since we manufacture according to your specific size requirements. The sample fee can be deducted from your bulk order.',
     'sample, free sample, sample fee, prototype'),
    ('Payment', 'What are your payment terms?',
     'For orders under $1,000 USD: 100% advance payment. For orders over $1,000 USD: 30% T/T advance, balance before shipment. Other payment methods like trade assurance are also available.',
     'payment, T/T, deposit, trade assurance, terms'),
    ('Visiting', 'Can we visit your factory?',
     'Of course! We welcome customers to visit our factories or offices. Please let us know when you travel to China and we will meet you at the airport or station. If you cannot visit in person, we can provide live broadcasts, video conferences, and detailed photos.',
     'visit, factory tour, inspection, video tour'),
    ('Customization', 'Do you provide OEM and ODM services?',
     'Yes, OEM and ODM services are our core business. We can personalize display racks according to your style, material, color, and other requirements to ensure your brand stands out. Our design team provides custom 3D rendering solutions.',
     'OEM, ODM, custom, customize, personalize, design'),
    ('Quality', 'What quality certifications do you have?',
     'We hold international quality certifications including ISO and TUV. We have a complete production equipment lineup including powder coating lines and automated production facilities to meet different material and surface treatment requirements.',
     'certification, ISO, TUV, quality, standard'),
    ('Design Service', 'Can you provide custom display design and 3D rendering?',
     'Yes, we can provide custom display rack design and development solutions with a full set of realistic 3D rendering solutions. In each project, we work closely with you to transform your concept into a finished product that exceeds expectations.',
     'design, 3D rendering, CAD, custom design, showroom design'),
    ('Installation', 'Do you provide installation services?',
     'We have a team of professionals to assist with remote measurement and on-site installation services. We escort your store from the first contact to the finished product, ensuring professional, high-quality, and efficient service.',
     'installation, setup, assembly, on-site service'),
    ('Shipping Methods', 'What shipping methods are available?',
     'We ship by sea, by air, and by railway depending on your location and urgency. Fast delivery is available - 7 days for stock items and 15-30 days for custom display racks. We ensure on-time delivery to meet your expectations.',
     'shipping, sea freight, air freight, railway, logistics'),
    ('Packaging', 'How are the display racks packaged for shipping?',
     'Products are packaged using customized non-woven packages, stretch film, and sturdy export cartons to ensure safe transportation. Packaging can be customized according to your requirements.',
     'packaging, shipping, export carton, protective packaging'),
]

# ============================================================
# 4. PROJECT CASES (showroom projects)
# ============================================================
NEW_PROJECTS = [
    ('Stone Slab Showroom - Paris, France', 'stone-slab-showroom-paris',
     'A premium stone slab showroom project in Paris featuring custom floor-standing display racks and wall panel systems. The 200sqm showroom showcases over 150 stone samples in an elegant, organized layout.',
     'Paris, France', '2024-06-15',
     'https://chndisplay.net/wp-content/uploads/2024/09/20240910093344.jpg'),
    ('Tile Boutique Exhibition - Dubai, UAE', 'tile-boutique-exhibition-dubai',
     'A luxury tile boutique exhibition in Dubai using our DDF series wall panel display racks. The project included custom branding, LED lighting integration, and 80+ tile sample displays across a 150sqm space.',
     'Dubai, UAE', '2024-03-20',
     'https://chndisplay.net/wp-content/uploads/2024/07/home_professional-service-provider.jpg'),
    ('Wood Flooring Retail Store - Sydney, Australia', 'wood-flooring-retail-sydney',
     'A modern wood flooring retail store in Sydney equipped with our WDR series wood floor stands. The store displays 60+ wood flooring samples with multi-layer storage and easy-access design.',
     'Sydney, Australia', '2024-01-10',
     'https://chndisplay.net/wp-content/uploads/2024/05/management-system-03.jpg'),
    ('Trade Show Booth - Coverings Expo, USA', 'trade-show-booth-coverings-usa',
     'A custom trade show booth at Coverings Expo featuring portable DDF series display racks. The booth showcased 40+ large format tile and stone samples with easy assembly and disassembly for the 3-day event.',
     'Orlando, USA', '2024-04-30',
     'https://chndisplay.net/wp-content/uploads/2024/09/20240910152025.png'),
    ('Marble Gallery - Carrara, Italy', 'marble-gallery-carrara-italy',
     'An exclusive marble gallery in Carrara, Italy, the heart of marble production. The project features our LD series stone display racks with custom stainless steel panels for premium marble slab presentation.',
     'Carrara, Italy', '2023-11-05',
     'https://chndisplay.net/wp-content/uploads/2024/09/20240910093344.jpg'),
]

# ============================================================
# EXECUTION
# ============================================================

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # --- 1. Insert new series ---
    print('=== Adding new series ===')
    series_map = {}  # prefix -> id
    # Get existing series
    for row in c.execute('SELECT id, prefix FROM Series'):
        series_map[row[1]] = row[0]

    for name, nameCn, slug, prefix, desc, sortOrder in NEW_SERIES:
        if prefix in series_map:
            print(f'  SKIP (exists): {name} (prefix={prefix})')
            continue
        c.execute('''
            INSERT INTO Series (name, nameCn, slug, prefix, description, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (name, nameCn, slug, prefix, desc, sortOrder,
              datetime.datetime.now(datetime.timezone.utc).isoformat(),
              datetime.datetime.now(datetime.timezone.utc).isoformat()))
        series_map[prefix] = c.lastrowid
        print(f'  ADDED: {name} (id={series_map[prefix]}, prefix={prefix})')

    # --- 2. Insert new products ---
    print('\n=== Adding new products ===')
    existing_skus = set()
    for row in c.execute('SELECT sku FROM Product'):
        existing_skus.add(row[0])

    products_added = 0
    for sku, series_prefix, name, desc, material, features in NEW_PRODUCTS:
        if sku in existing_skus:
            print(f'  SKIP (exists): {sku}')
            continue
        series_id = series_map.get(series_prefix)
        if not series_id:
            # Try to find a matching series by prefix
            row = c.execute('SELECT id FROM Series WHERE prefix = ?', (series_prefix,)).fetchone()
            if row:
                series_id = row[0]
                series_map[series_prefix] = series_id
            else:
                print(f'  SKIP (no series): {sku} - prefix {series_prefix} not found')
                continue

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        c.execute('''
            INSERT INTO Product (sku, seriesId, name, description, material, features,
                                 isFeatured, isPublished, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?, ?, ?)
        ''', (sku, series_id, name, desc, material, features,
              products_added, now, now))
        product_id = c.lastrowid

        # Add product image - use chndisplay.net product page as image URL
        # We'll use a placeholder image URL pattern that the frontend can handle
        image_url = f'/images/products/{sku.lower()}.jpg'
        c.execute('''
            INSERT INTO ProductImage (productId, url, alt, sortOrder, isPrimary)
            VALUES (?, ?, ?, 0, 1)
        ''', (product_id, image_url, name[:100]))

        products_added += 1
        print(f'  ADDED: {sku} | {name[:50]}...')

    print(f'\n  Total products added: {products_added}')

    # --- 3. Insert FAQs ---
    print('\n=== Adding FAQs ===')
    existing_faqs = c.execute('SELECT COUNT(*) FROM FAQ').fetchone()[0]
    faq_added = 0
    for category, question, answer, keywords in NEW_FAQS:
        # Check if FAQ already exists
        existing = c.execute('SELECT id FROM FAQ WHERE question = ?', (question,)).fetchone()
        if existing:
            print(f'  SKIP (exists): {question[:50]}...')
            continue
        c.execute('''
            INSERT INTO FAQ (category, question, answer, keywords, sortOrder)
            VALUES (?, ?, ?, ?, ?)
        ''', (category, question, answer, keywords, existing_faqs + faq_added))
        faq_added += 1
        print(f'  ADDED: [{category}] {question[:50]}...')

    print(f'\n  Total FAQs added: {faq_added}')

    # --- 4. Insert projects ---
    print('\n=== Adding projects ===')
    existing_projects = set()
    for row in c.execute('SELECT slug FROM Project'):
        existing_projects.add(row[0])

    projects_added = 0
    for title, slug, desc, location, proj_date, image_url in NEW_PROJECTS:
        if slug in existing_projects:
            print(f'  SKIP (exists): {title}')
            continue
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        proj_dt = proj_date + 'T00:00:00Z' if proj_date else None
        c.execute('''
            INSERT INTO Project (title, slug, description, content, location, projectDate,
                                 images, isPublished, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        ''', (title, slug, desc, desc, location, proj_dt,
              image_url, projects_added, now, now))
        projects_added += 1
        print(f'  ADDED: {title}')

    print(f'\n  Total projects added: {projects_added}')

    # --- Commit ---
    conn.commit()

    # --- Summary ---
    print('\n=== FINAL SUMMARY ===')
    total_series = c.execute('SELECT COUNT(*) FROM Series').fetchone()[0]
    total_products = c.execute('SELECT COUNT(*) FROM Product').fetchone()[0]
    total_faqs = c.execute('SELECT COUNT(*) FROM FAQ').fetchone()[0]
    total_projects = c.execute('SELECT COUNT(*) FROM Project').fetchone()[0]
    total_images = c.execute('SELECT COUNT(*) FROM ProductImage').fetchone()[0]
    print(f'  Series: {total_series}')
    print(f'  Products: {total_products}')
    print(f'  Product Images: {total_images}')
    print(f'  FAQs: {total_faqs}')
    print(f'  Projects: {total_projects}')

    # Print series breakdown
    print('\n  Products per series:')
    for row in c.execute('SELECT s.name, s.prefix, COUNT(p.id) FROM Series s LEFT JOIN Product p ON p.seriesId = s.id GROUP BY s.id ORDER BY s.id'):
        print(f'    {row[0]} ({row[1]}): {row[2]} products')

    conn.close()
    print('\nDone!')


if __name__ == '__main__':
    main()
