-- Migration: Add attachments column to Inquiry table
-- Date: 2026-08-04
-- Description: Adds a TEXT column to store JSON-encoded attachment metadata
--              for inquiry file uploads. The column is nullable for backward
--              compatibility with existing inquiries that have no attachments.
--              Since prisma generate is blocked, this DDL is applied via
--              scripts/run-migrate-attachments.py using Python sqlite3.

ALTER TABLE Inquiry ADD COLUMN attachments TEXT;
