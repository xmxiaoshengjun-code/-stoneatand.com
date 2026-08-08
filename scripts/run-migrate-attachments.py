#!/usr/bin/env python3
"""
Migration script: Add `attachments` column to the Inquiry table.

Since `prisma generate` is blocked in the current sandbox, we cannot use
`prisma migrate`. This script applies the DDL directly via Python's sqlite3
module to the project's SQLite database.

Usage:
    python scripts/run-migrate-attachments.py

The script is idempotent — if the column already exists, it prints a message
and exits without error.
"""

import os
import sqlite3
import sys


def get_db_path():
    """Return the absolute path to the SQLite database file."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(script_dir, "qianfan-seed2.db")


def column_exists(cursor, table_name, column_name):
    """Check whether a column already exists in the given table."""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    return any(col[1] == column_name for col in columns)


def main():
    db_path = get_db_path()

    if not os.path.exists(db_path):
        print(f"ERROR: Database file not found at: {db_path}")
        sys.exit(1)

    print(f"Database: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        if column_exists(cursor, "Inquiry", "attachments"):
            print("Column 'attachments' already exists in Inquiry table. Skipping migration.")
        else:
            cursor.execute("ALTER TABLE Inquiry ADD COLUMN attachments TEXT;")
            conn.commit()
            print("SUCCESS: Added 'attachments' column to Inquiry table.")

        # Verify
        if column_exists(cursor, "Inquiry", "attachments"):
            print("Verification: Column 'attachments' is present.")
        else:
            print("ERROR: Column 'attachments' was not added. Check for errors.")
            sys.exit(1)

    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

    print("Migration complete.")


if __name__ == "__main__":
    main()
