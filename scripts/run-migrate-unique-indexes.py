import sqlite3
import sys
import os

def get_db_path():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(script_dir, "qianfan-seed2.db")

def index_exists(cursor, table_name, index_name):
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name=? AND name=?",
        (table_name, index_name)
    )
    return cursor.fetchone() is not None

def has_duplicates(cursor, table_name, column_name):
    cursor.execute(
        f"SELECT {column_name}, COUNT(*) as cnt FROM {table_name} "
        f"WHERE {column_name} IS NOT NULL GROUP BY {column_name} HAVING cnt > 1"
    )
    return cursor.fetchall()

def main():
    db_path = get_db_path()
    if not os.path.exists(db_path):
        print(f"ERROR: Database file not found at: {db_path}")
        sys.exit(1)

    print(f"Database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    indexes_to_create = [
        ("ContentPage", "slug", "ContentPage_slug_key"),
        ("Inquiry", "inquiryNo", "Inquiry_inquiryNo_key"),
        ("Product", "sku", "Product_sku_key"),
    ]

    for table, column, index_name in indexes_to_create:
        if index_exists(cursor, table, index_name):
            print(f"Index '{index_name}' already exists on {table}.{column}. Skipping.")
            continue

        # Check for duplicate values before creating unique index
        dupes = has_duplicates(cursor, table, column)
        if dupes:
            print(f"WARNING: Cannot create unique index on {table}.{column} — found duplicates:")
            for d in dupes:
                print(f"  {d[0]}: {d[1]} occurrences")
            continue

        try:
            cursor.execute(
                f'CREATE UNIQUE INDEX "{index_name}" ON "{table}"("{column}")'
            )
            conn.commit()
            print(f"SUCCESS: Created unique index '{index_name}' on {table}.{column}")
        except sqlite3.Error as e:
            print(f"ERROR creating index on {table}.{column}: {e}")
            conn.rollback()

    # Also add non-unique indexes that Prisma schema defines but DB is missing
    non_unique_indexes = [
        ("Inquiry", "status", "Inquiry_status_idx"),
        ("Inquiry", "email", "Inquiry_email_idx"),
        ("Inquiry", "customerId", "Inquiry_customerId_idx"),
        ("Product", "seriesId", "Product_seriesId_idx"),
        ("Product", "isPublished", "Product_isPublished_idx"),
        ("ContentPage", "slug", "ContentPage_slug_idx"),
    ]

    for table, column, index_name in non_unique_indexes:
        if index_exists(cursor, table, index_name):
            continue
        # Skip if a unique index with same name pattern already exists
        unique_name = index_name.replace("_idx", "_key")
        if index_exists(cursor, table, unique_name):
            continue
        try:
            cursor.execute(
                f'CREATE INDEX "{index_name}" ON "{table}"("{column}")'
            )
            conn.commit()
            print(f"Created non-unique index '{index_name}' on {table}.{column}")
        except sqlite3.Error as e:
            print(f"NOTE: Could not create index {index_name}: {e}")

    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    main()
