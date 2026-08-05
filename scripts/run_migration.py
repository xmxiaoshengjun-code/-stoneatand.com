#!/usr/bin/env python3
"""Execute migration and seed SQL against the SQLite database."""
import sqlite3
import os
import sys

db_path = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def execute_sql_file(filepath):
    """Execute a SQL file, splitting by semicolons and handling errors."""
    with open(filepath, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    statements = []
    for stmt in sql_content.split(';'):
        stmt = stmt.strip()
        lines = [l for l in stmt.split('\n') if not l.strip().startswith('--')]
        clean_stmt = '\n'.join(lines).strip()
        if clean_stmt:
            statements.append(clean_stmt)

    print(f'Found {len(statements)} SQL statements in {os.path.basename(filepath)}')
    for i, stmt in enumerate(statements):
        first_line = stmt.split('\n')[0][:80]
        try:
            cursor.execute(stmt)
            conn.commit()
            print(f'  [{i+1}/{len(statements)}] OK: {first_line}')
        except Exception as e:
            if 'duplicate column name' in str(e):
                print(f'  [{i+1}/{len(statements)}] SKIP (already exists): {first_line}')
            elif 'already exists' in str(e):
                print(f'  [{i+1}/{len(statements)}] SKIP (already exists): {first_line}')
            else:
                print(f'  [{i+1}/{len(statements)}] ERROR: {first_line} -> {e}')
                conn.rollback()
    print()

# Execute migration
print('=== Executing migrate-additional-tables.sql ===')
execute_sql_file(os.path.join(os.path.dirname(__file__), 'migrate-additional-tables.sql'))

# Execute seed files
print('=== Executing seed-default-settings.sql ===')
execute_sql_file(os.path.join(os.path.dirname(__file__), 'seed-default-settings.sql'))

print('=== Executing seed-inquiry-form-fields.sql ===')
execute_sql_file(os.path.join(os.path.dirname(__file__), 'seed-inquiry-form-fields.sql'))

# Verify: list all tables
print('=== Final table list ===')
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
for row in cursor.fetchall():
    print(f'  {row[0]}')

# Verify Series columns
print('\n=== Series columns ===')
cursor.execute('PRAGMA table_info(Series)')
for col in cursor.fetchall():
    print(f'  {col[1]} ({col[2]})')

# Verify TrackingEvent columns
print('\n=== TrackingEvent columns ===')
cursor.execute('PRAGMA table_info(TrackingEvent)')
for col in cursor.fetchall():
    print(f'  {col[1]} ({col[2]})')

# Verify SiteSetting count
cursor.execute('SELECT COUNT(*) FROM SiteSetting')
count = cursor.fetchone()[0]
print(f'\nSiteSetting count: {count}')

# Verify InquiryFormField count
cursor.execute('SELECT COUNT(*) FROM InquiryFormField')
count = cursor.fetchone()[0]
print(f'InquiryFormField count: {count}')

# Show new settings
cursor.execute("SELECT key, value FROM SiteSetting WHERE key IN ('siteFavicon','gaTrackingId','watermarkEnabled','watermarkType','watermarkText','watermarkImage','watermarkPosition','watermarkOpacity','watermarkSize','copyProtectionEnabled','enabledLocales') ORDER BY key")
print('\nNew SiteSetting entries:')
for row in cursor.fetchall():
    print(f'  {row[0]} = {row[1]}')

conn.close()
print('\nMigration completed successfully!')
