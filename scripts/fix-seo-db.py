#!/usr/bin/env python3
"""
SEO DB Fix Script — P0-7, P0-8, P1-16
Fixes:
  P0-7: Product description differentiation for duplicate descriptions
  P0-8: Product image alt text optimization
  P1-16: FAQ/ContentPage data corrections (16 years→18+, 6 countries→80+, 55→172, 7→17, Foshan→Xiamen, Qianfan→TSIANFAN)
"""

import sqlite3
import os
import sys
import re

DB_PATH = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')

def get_series_map(cursor):
    """Get a map of seriesId -> series info."""
    cursor.execute('SELECT id, name, slug, prefix FROM Series')
    series_map = {}
    for row in cursor.fetchall():
        series_map[row[0]] = {'name': row[1], 'slug': row[2], 'prefix': row[3]}
    return series_map

def fix_duplicate_descriptions(cursor, series_map):
    """
    P0-7: For products with duplicate descriptions, generate differentiated
    descriptions and features based on product name, SKU, series, and specs.
    """
    # Find all duplicate description groups
    cursor.execute('''
        SELECT description FROM Product 
        WHERE description IS NOT NULL 
        GROUP BY description HAVING COUNT(*) > 1
    ''')
    dup_descs = [row[0] for row in cursor.fetchall()]
    
    total_fixed = 0
    for dup_desc in dup_descs:
        # Get all products with this duplicate description
        cursor.execute('''
            SELECT id, sku, name, description, features, standSize, panelSize, 
                   panelThickness, packageSize, numberOfPanel, material, weight,
                   seriesId
            FROM Product 
            WHERE description = ?
            ORDER BY id
        ''', (dup_desc,))
        products = cursor.fetchall()
        
        for p in products:
            (pid, sku, name, desc, features, standSize, panelSize,
             panelThickness, packageSize, numberOfPanel, material, weight, seriesId) = p
            
            series_info = series_map.get(seriesId, {'name': 'Display Rack', 'prefix': ''})
            series_name = series_info['name']
            
            # Build differentiated description
            desc_parts = [name]
            
            if series_name:
                desc_parts.append(f' - {series_name}')
            
            # Add key spec info
            spec_parts = []
            if standSize:
                spec_parts.append(f'Stand size: {standSize}')
            if panelSize:
                spec_parts.append(f'Panel size: {panelSize}')
            if panelThickness:
                spec_parts.append(f'Thickness: {panelThickness}')
            if numberOfPanel:
                spec_parts.append(f'{numberOfPanel} panels')
            if material:
                spec_parts.append(f'Material: {material}')
            
            base_desc = dup_desc.split('.')[0] if '.' in dup_desc else dup_desc.strip()
            
            new_desc = f'{name} ({sku}) - {series_name}. {base_desc}. '
            if spec_parts:
                new_desc += 'Key specs: ' + ', '.join(spec_parts) + '. '
            new_desc += f'Professional B2B display solution by TSIANFAN.'
            
            # Truncate if too long
            if len(new_desc) > 500:
                new_desc = new_desc[:497] + '...'
            
            # Build differentiated features
            feature_list = []
            if standSize:
                feature_list.append(f'Stand dimensions: {standSize}')
            if panelSize:
                feature_list.append(f'Accommodates panels: {panelSize}')
            if panelThickness:
                feature_list.append(f'Panel thickness range: {panelThickness}')
            if numberOfPanel:
                feature_list.append(f'Holds up to {numberOfPanel} display panels')
            if material:
                feature_list.append(f'Construction: {material}')
            if weight:
                feature_list.append(f'Unit weight: {weight}')
            
            # Add series-specific feature
            feature_list.append(f'Part of the {series_name} series (SKU: {sku})')
            feature_list.append('OEM/ODM customization available')
            
            new_features = str(feature_list)
            
            cursor.execute('''
                UPDATE Product 
                SET description = ?, features = ?
                WHERE id = ?
            ''', (new_desc, new_features, pid))
            total_fixed += 1
    
    print(f'P0-7: Fixed {total_fixed} products with duplicate descriptions')
    return total_fixed

def fix_image_alt_text(cursor, series_map):
    """
    P0-8: Update ProductImage alt text to be descriptive.
    Format: "{product.name} - {series.name} display rack - {key spec}"
    """
    cursor.execute('''
        SELECT pi.id, pi.productId, pi.alt, pi.isPrimary,
               p.sku, p.name, p.standSize, p.panelSize, p.seriesId
        FROM ProductImage pi
        JOIN Product p ON pi.productId = p.id
    ''')
    images = cursor.fetchall()
    
    total_fixed = 0
    for img in images:
        (img_id, product_id, old_alt, is_primary, sku, name, standSize, panelSize, seriesId) = img
        
        series_info = series_map.get(seriesId, {'name': 'Display Rack'})
        series_name = series_info['name']
        
        # Build descriptive alt text
        alt_parts = [name, f'{series_name} display rack']
        
        # Add key spec
        spec_parts = []
        if panelSize:
            spec_parts.append(f'{panelSize} panels')
        if standSize:
            spec_parts.append(f'{standSize} stand')
        
        if spec_parts:
            alt_parts.append(' - '.join(spec_parts))
        
        # Add primary/angle indicator
        if is_primary:
            alt_parts.append('main view')
        
        new_alt = ' - '.join(alt_parts[:3])  # Keep it concise
        if len(new_alt) > 200:
            new_alt = new_alt[:197] + '...'
        
        cursor.execute('UPDATE ProductImage SET alt = ? WHERE id = ?', (new_alt, img_id))
        total_fixed += 1
    
    print(f'P0-8: Updated alt text for {total_fixed} product images')
    return total_fixed

def fix_faq_data(cursor):
    """
    P1-16: Fix FAQ entries with outdated data.
    - "16 years" → "18+ years"
    - "6 countries" → "80+ countries"
    - "55 SKUs across 7 series" → "172 SKUs across 17 series"
    - "Qianfan" → "TSIANFAN"
    """
    cursor.execute('SELECT id, question, answer FROM FAQ')
    faqs = cursor.fetchall()
    
    total_fixed = 0
    for faq in faqs:
        faq_id, question, answer = faq
        new_question = question
        new_answer = answer
        
        # Fix years
        new_answer = new_answer.replace('16 years', '18+ years')
        new_answer = new_answer.replace('16+ years', '18+ years')
        
        # Fix countries
        new_answer = new_answer.replace('over 6 countries', 'over 80 countries')
        new_answer = new_answer.replace('6 countries', '80+ countries')
        new_answer = new_answer.replace('over 80 countries', 'over 80 countries')
        
        # Fix SKU/series counts — use word boundaries to avoid matching
        # '7' inside '17' (which would produce '117')
        new_answer = new_answer.replace('55 SKUs across 7 product series', '172 SKUs across 17 product series')
        new_answer = new_answer.replace('55 SKUs across 7 series', '172 SKUs across 17 series')
        new_answer = re.sub(r'\b55 SKUs\b', '172 SKUs', new_answer)
        new_answer = re.sub(r'\b7 product series\b', '17 product series', new_answer)
        new_answer = re.sub(r'\b7 series\b', '17 series', new_answer)

        # Fix brand name
        new_answer = new_answer.replace('Qianfan has', 'TSIANFAN has')
        new_answer = new_answer.replace('Qianfan is', 'TSIANFAN is')
        new_answer = new_answer.replace('about Qianfan', 'about TSIANFAN')
        new_answer = new_answer.replace('Qianfan display', 'TSIANFAN display')
        new_answer = new_answer.replace('Qianfan ', 'TSIANFAN ')

        new_question = new_question.replace('Qianfan', 'TSIANFAN')
        new_question = re.sub(r'\b55 SKUs\b', '172 SKUs', new_question)
        new_question = re.sub(r'\b7 series\b', '17 series', new_question)
        
        if new_question != question or new_answer != answer:
            cursor.execute('UPDATE FAQ SET question = ?, answer = ? WHERE id = ?',
                          (new_question, new_answer, faq_id))
            total_fixed += 1
            print(f'  FAQ {faq_id}: Updated')
    
    print(f'P1-16: Fixed {total_fixed} FAQ entries')
    return total_fixed

def fix_content_page_data(cursor):
    """
    P1-16: Fix ContentPage entries with outdated data.
    - "Foshan, Guangdong, China" → "Xiamen, Fujian, China"
    - "16 years" → "18+ years"
    - "6 countries" → "80+ countries"
    - "55" → "172", "7 series" → "17 series"
    - "Qianfan" → "TSIANFAN"
    """
    cursor.execute('SELECT id, slug, title, content, metaTitle, metaDescription FROM ContentPage')
    pages = cursor.fetchall()
    
    total_fixed = 0
    for page in pages:
        (page_id, slug, title, content, metaTitle, metaDescription) = page
        new_content = content or ''
        new_meta_title = metaTitle or ''
        new_meta_desc = metaDescription or ''
        
        changes = []
        
        # Apply replacements. Non-numeric ones use simple str.replace.
        # Numeric patterns (7 series, 55 SKUs) use regex word boundaries
        # to avoid matching '7' inside '17' (which would produce '117').
        simple_replacements = [
            ('Foshan', 'Xiamen', 'city'),
            ('Guangdong', 'Fujian', 'province'),
            ('16 years', '18+ years', 'years'),
            ('16+ years', '18+ years', 'years'),
            ('over 6 countries', 'over 80 countries', 'countries'),
            ('6 countries', '80+ countries', 'countries'),
            ('55 SKUs across 7 product series', '172 SKUs across 17 product series', 'stats'),
            ('55 SKUs across 7 series', '172 SKUs across 17 series', 'stats'),
            ('Qianfan', 'TSIANFAN', 'brand'),
        ]
        regex_replacements = [
            (r'\b55 SKUs\b', '172 SKUs', 'skus'),
            (r'\b7 product series\b', '17 product series', 'series'),
            (r'\b7 series\b', '17 series', 'series'),
        ]

        for old_val, new_val, label in simple_replacements:
            if old_val in new_content:
                new_content = new_content.replace(old_val, new_val)
                changes.append(label)
            if old_val in new_meta_title:
                new_meta_title = new_meta_title.replace(old_val, new_val)
                changes.append(f'metaTitle:{label}')
            if old_val in new_meta_desc:
                new_meta_desc = new_meta_desc.replace(old_val, new_val)
                changes.append(f'metaDesc:{label}')

        for pattern, new_val, label in regex_replacements:
            if re.search(pattern, new_content):
                new_content = re.sub(pattern, new_val, new_content)
                changes.append(label)
            if re.search(pattern, new_meta_title):
                new_meta_title = re.sub(pattern, new_val, new_meta_title)
                changes.append(f'metaTitle:{label}')
            if re.search(pattern, new_meta_desc):
                new_meta_desc = re.sub(pattern, new_val, new_meta_desc)
                changes.append(f'metaDesc:{label}')
        
        if changes:
            cursor.execute('''
                UPDATE ContentPage 
                SET content = ?, metaTitle = ?, metaDescription = ?
                WHERE id = ?
            ''', (new_content, new_meta_title, new_meta_desc, page_id))
            total_fixed += 1
            print(f'  ContentPage {page_id} (slug={slug}): Fixed {", ".join(changes)}')
    
    print(f'P1-16: Fixed {total_fixed} ContentPage entries')
    return total_fixed

def fix_corrupted_data(cursor):
    """
    Fix data corrupted by the previous buggy run of this script.
    The bug: str.replace('7 product series', '17 product series') matched
    the '7' inside '17 product series', producing '117 product series'.
    Same for '7 series' → '117 series'.
    """
    total_fixed = 0

    # Fix FAQ table
    cursor.execute('SELECT id, question, answer FROM FAQ')
    for faq_id, question, answer in cursor.fetchall():
        new_q = question
        new_a = answer
        if answer:
            new_a = new_a.replace('117 product series', '17 product series')
            new_a = new_a.replace('117 series', '17 series')
        if question:
            new_q = new_q.replace('117 product series', '17 product series')
            new_q = new_q.replace('117 series', '17 series')
        if new_q != question or new_a != answer:
            cursor.execute('UPDATE FAQ SET question = ?, answer = ? WHERE id = ?',
                          (new_q, new_a, faq_id))
            total_fixed += 1

    # Fix ContentPage table
    cursor.execute('SELECT id, slug, title, content, metaTitle, metaDescription FROM ContentPage')
    for page_id, slug, title, content, metaTitle, metaDesc in cursor.fetchall():
        new_content = content or ''
        new_meta_title = metaTitle or ''
        new_meta_desc = metaDesc or ''
        changed = False
        for old_val, new_val in [('117 product series', '17 product series'), ('117 series', '17 series')]:
            if old_val in new_content:
                new_content = new_content.replace(old_val, new_val)
                changed = True
            if old_val in new_meta_title:
                new_meta_title = new_meta_title.replace(old_val, new_val)
                changed = True
            if old_val in new_meta_desc:
                new_meta_desc = new_meta_desc.replace(old_val, new_val)
                changed = True
        if changed:
            cursor.execute('UPDATE ContentPage SET content = ?, metaTitle = ?, metaDescription = ? WHERE id = ?',
                          (new_content, new_meta_title, new_meta_desc, page_id))
            total_fixed += 1

    print(f'Cleanup: Fixed {total_fixed} corrupted records (117→17)')
    return total_fixed


def fix_project_testimonial_brands(cursor):
    """
    P1-12: Fix remaining 'Qianfan' brand references in Project and
    Testimonial tables.
    """
    total_fixed = 0

    # Fix Project table — check all text columns
    cursor.execute('PRAGMA table_info(Project)')
    proj_cols = [r[1] for r in cursor.fetchall()]
    for col in proj_cols:
        if col.lower() == 'id':
            continue
        cursor.execute(f'SELECT id, {col} FROM Project WHERE {col} LIKE "%Qianfan%"')
        for row in cursor.fetchall():
            if row[1] and 'Qianfan' in str(row[1]):
                new_val = str(row[1]).replace('Qianfan', 'TSIANFAN')
                cursor.execute(f'UPDATE Project SET {col} = ? WHERE id = ?', (new_val, row[0]))
                total_fixed += 1
                print(f'  Project.{col} (id={row[0]}): Fixed brand name')

    # Fix Testimonial table — check all text columns
    cursor.execute('PRAGMA table_info(Testimonial)')
    test_cols = [r[1] for r in cursor.fetchall()]
    for col in test_cols:
        if col.lower() == 'id':
            continue
        cursor.execute(f'SELECT id, {col} FROM Testimonial WHERE {col} LIKE "%Qianfan%"')
        for row in cursor.fetchall():
            if row[1] and 'Qianfan' in str(row[1]):
                new_val = str(row[1]).replace('Qianfan', 'TSIANFAN')
                cursor.execute(f'UPDATE Testimonial SET {col} = ? WHERE id = ?', (new_val, row[0]))
                total_fixed += 1
                print(f'  Testimonial.{col} (id={row[0]}): Fixed brand name')

    print(f'P1-12: Fixed {total_fixed} Project/Testimonial brand references')
    return total_fixed


def main():
    if not os.path.exists(DB_PATH):
        print(f'ERROR: Database not found at {DB_PATH}')
        sys.exit(1)
    
    print(f'Connecting to database: {DB_PATH}')
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        series_map = get_series_map(cursor)

        print('\n=== Cleanup: Fix corrupted data from previous buggy run ===')
        fix_corrupted_data(cursor)

        print('\n=== P0-7: Product description differentiation ===')
        fix_duplicate_descriptions(cursor, series_map)
        
        print('\n=== P0-8: Image alt text optimization ===')
        fix_image_alt_text(cursor, series_map)
        
        print('\n=== P1-16: FAQ data corrections ===')
        fix_faq_data(cursor)
        
        print('\n=== P1-16: ContentPage data corrections ===')
        fix_content_page_data(cursor)

        print('\n=== P1-12: Project/Testimonial brand name fixes ===')
        fix_project_testimonial_brands(cursor)

        conn.commit()
        print('\n✓ All DB fixes committed successfully.')
        
    except Exception as e:
        conn.rollback()
        print(f'\n✗ ERROR: {e}')
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    main()
