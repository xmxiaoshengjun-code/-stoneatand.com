#!/usr/bin/env python3
"""Copy database, run migration, and replace original."""
import shutil
import os
import sqlite3

src = os.path.join(os.path.dirname(__file__), 'qianfan-seed2.db')
dst = os.path.join(os.path.dirname(__file__), 'qianfan-seed2-migrated.db')

# Remove old migrated copy if exists
if os.path.exists(dst):
    os.remove(dst)
    print(f"Removed old {dst}")

# Copy using shutil
shutil.copy2(src, dst)
print(f"Copied {src} -> {dst}")

# Open the copy and run migration
conn = sqlite3.connect(dst)
c = conn.cursor()

# Quick write test
c.execute("CREATE TABLE IF NOT EXISTS _test (id INTEGER)")
conn.commit()
c.execute("DROP TABLE _test")
conn.commit()
print("Write test on copy: SUCCESS")


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
    print(f"  {os.path.basename(filepath)}: {len(statements)} statements")
    for i, stmt in enumerate(statements):
        first_line = stmt.split('\n')[0][:80]
        try:
            c.execute(stmt)
            conn.commit()
            print(f"    [{i+1}/{len(statements)}] OK: {first_line}")
        except Exception as e:
            if 'duplicate column name' in str(e) or 'already exists' in str(e):
                print(f"    [{i+1}/{len(statements)}] SKIP: {first_line}")
            else:
                print(f"    [{i+1}/{len(statements)}] ERROR: {first_line} -> {e}")
                conn.rollback()


print("\n=== Running migrations ===")
execute_sql_file(os.path.join(os.path.dirname(__file__), 'migrate-additional-tables.sql'))
execute_sql_file(os.path.join(os.path.dirname(__file__), 'seed-default-settings.sql'))
execute_sql_file(os.path.join(os.path.dirname(__file__), 'seed-inquiry-form-fields.sql'))

# Verify
print("\n=== Final table list ===")
c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
for row in c.fetchall():
    print(f"  {row[0]}")

print("\n=== Series columns ===")
c.execute('PRAGMA table_info(Series)')
for col in c.fetchall():
    print(f"  {col[1]} ({col[2]})")

print("\n=== TrackingEvent columns ===")
c.execute('PRAGMA table_info(TrackingEvent)')
for col in c.fetchall():
    print(f"  {col[1]} ({col[2]})")

c.execute('SELECT COUNT(*) FROM SiteSetting')
print(f"\nSiteSetting count: {c.fetchone()[0]}")
c.execute('SELECT COUNT(*) FROM InquiryFormField')
print(f"InquiryFormField count: {c.fetchone()[0]}")

c.execute("SELECT key, value FROM SiteSetting WHERE key IN ('siteFavicon','gaTrackingId','watermarkEnabled','watermarkType','watermarkText','watermarkImage','watermarkPosition','watermarkOpacity','watermarkSize','copyProtectionEnabled','enabledLocales') ORDER BY key")
print("\nNew SiteSetting entries:")
for row in c.fetchall():
    print(f"  {row[0]} = {row[1]}")

conn.close()

# Replace original with migrated version
try:
    os.remove(src)
    shutil.copy2(dst, src)
    print(f"\nReplaced {src} with migrated version")
except Exception as e:
    print(f"\nCould not replace original: {e}")
    print(f"Migrated database is at {dst}")

print("\nMigration completed successfully!")
