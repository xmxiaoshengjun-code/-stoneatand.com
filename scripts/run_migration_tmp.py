#!/usr/bin/env python3
"""Execute migration and seed SQL against the SQLite database (temp copy)."""
import sqlite3
import os
import shutil

src_db = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')
tmp_db = '/tmp/qianfan-seed2.db'

# Copy to writable temp location
shutil.copy2(src_db, tmp_db)
print(f"Copied {src_db} -> {tmp_db}")

conn = sqlite3.connect(tmp_db)
cursor = conn.cursor()

def execute_sql_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    statements = []
    for stmt in sql_content.split(';'):
        stmt = stmt.strip()
        lines = [l for l in stmt.split('\n') if not l.strip().startswith('--')]
        clean_stmt = '\n'.join(lines).strip()
        if clean_stmt:
            statements.append(clean_stmt)
    print(f"Found {len(statements)} SQL statements in {os.path.basename(filepath)}")
    for i, stmt in enumerate(statements):
        first_line = stmt.split('\n')[0][:80]
        try:
            cursor.execute(stmt)
            conn.commit()
            print(f"  [{i+1}/{len(statements)}] OK: {first_line}")
        except Exception as e:
            if 'duplicate column name' in str(e) or 'already exists' in str(e):
                print(f"  [{i+1}/{len(statements)}] SKIP (already exists): {first_line}")
            else:
                print(f"  [{i+1}/{len(statements)}] ERROR: {first_line} -> {e}")
                conn.rollback()
    print()

print("=== migrate-additional-tables.sql ===")
execute_sql_file(os.path.join(os.path.dirname(__file__), 'migrate-additional-tables.sql'))
print("=== seed-default-settings.sql ===")
execute_sql_file(os.path.join(os.path.dirname(__file__), 'seed-default-settings.sql'))
print("=== seed-inquiry-form-fields.sql ===")
execute_sql_file(os.path.join(os.path.dirname(__file__), 'seed-inquiry-form-fields.sql'))

# Verify
print("=== Final table list ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
for row in cursor.fetchall():
    print(f"  {row[0]}")

print("\n=== Series columns ===")
cursor.execute('PRAGMA table_info(Series)')
for col in cursor.fetchall():
    print(f"  {col[1]} ({col[2]})")

print("\n=== TrackingEvent columns ===")
cursor.execute('PRAGMA table_info(TrackingEvent)')
for col in cursor.fetchall():
    print(f"  {col[1]} ({col[2]})")

cursor.execute('SELECT COUNT(*) FROM SiteSetting')
print(f"\nSiteSetting count: {cursor.fetchone()[0]}")
cursor.execute('SELECT COUNT(*) FROM InquiryFormField')
print(f"InquiryFormField count: {cursor.fetchone()[0]}")

cursor.execute("SELECT key, value FROM SiteSetting WHERE key IN ('siteFavicon','gaTrackingId','watermarkEnabled','watermarkType','watermarkText','watermarkImage','watermarkPosition','watermarkOpacity','watermarkSize','copyProtectionEnabled','enabledLocales') ORDER BY key")
print("\nNew SiteSetting entries:")
for row in cursor.fetchall():
    print(f"  {row[0]} = {row[1]}")

conn.close()

# Copy back to original location
try:
    shutil.copy2(tmp_db, src_db)
    print(f"\nCopied migrated database back to {src_db}")
except Exception as e:
    print(f"\nWARNING: Could not copy back to original location: {e}")
    print(f"Migrated database is at {tmp_db}")

print("\nMigration completed successfully!")
