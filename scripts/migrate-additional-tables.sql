-- ============================================================
-- Migration: Additional tables for UEESHOP incremental features
-- Date: 2026-08-04
-- Database: SQLite (scripts/qianfan-seed2.db)
-- ============================================================

-- 1. InquiryFormField — inquiry form field configuration (P0-05)
CREATE TABLE IF NOT EXISTS InquiryFormField (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  fieldName   TEXT UNIQUE NOT NULL,
  fieldLabel  TEXT NOT NULL,
  fieldType   TEXT NOT NULL DEFAULT 'text',
  isRequired  INTEGER NOT NULL DEFAULT 0,
  isActive    INTEGER NOT NULL DEFAULT 1,
  sortOrder   INTEGER NOT NULL DEFAULT 0,
  createdAt   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updatedAt   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 2. Download — downloadable resources (P1-02)
CREATE TABLE IF NOT EXISTS Download (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  filePath    TEXT NOT NULL,
  fileName    TEXT NOT NULL,
  fileType    TEXT NOT NULL,
  fileSize    INTEGER NOT NULL,
  category    TEXT NOT NULL DEFAULT 'other',
  sortOrder   INTEGER NOT NULL DEFAULT 0,
  isPublished INTEGER NOT NULL DEFAULT 1,
  createdAt   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updatedAt   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 3. FriendLink — friend links (P1-03)
CREATE TABLE IF NOT EXISTS FriendLink (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  url        TEXT NOT NULL,
  logo       TEXT,
  sortOrder  INTEGER NOT NULL DEFAULT 0,
  isVisible  INTEGER NOT NULL DEFAULT 1,
  createdAt  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updatedAt  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 4. Redirect — 301 redirect rules (P1-05)
CREATE TABLE IF NOT EXISTS Redirect (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  sourceUrl  TEXT UNIQUE NOT NULL,
  targetUrl  TEXT NOT NULL,
  isActive   INTEGER NOT NULL DEFAULT 1,
  createdAt  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updatedAt  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 5. MediaLibrary — unified image library (P2-02)
CREATE TABLE IF NOT EXISTS MediaLibrary (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  filename   TEXT NOT NULL,
  url        TEXT NOT NULL,
  alt        TEXT,
  category   TEXT NOT NULL DEFAULT 'general',
  fileSize   INTEGER NOT NULL,
  mimeType   TEXT NOT NULL,
  width      INTEGER,
  height     INTEGER,
  uploadedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 6. B2BListing — B2B platform listing records (P2-05)
CREATE TABLE IF NOT EXISTS B2BListing (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  productId        INTEGER NOT NULL,
  platformName     TEXT NOT NULL,
  listingUrl       TEXT,
  generatedContent TEXT,
  exportFormat     TEXT,
  status           TEXT NOT NULL DEFAULT 'draft',
  createdAt        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updatedAt        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- ============================================================
-- ALTER TABLE: Add new columns to existing tables
-- ============================================================

-- Series: add parentId for tree structure (P1-07)
-- SQLite ALTER TABLE ADD COLUMN is idempotent-safe: if column exists, the
-- error is caught by the migration runner.
ALTER TABLE Series ADD COLUMN parentId INTEGER;

-- TrackingEvent: add referrer, deviceType, sourceCategory (P1-01)
ALTER TABLE TrackingEvent ADD COLUMN referrer TEXT;
ALTER TABLE TrackingEvent ADD COLUMN deviceType TEXT;
ALTER TABLE TrackingEvent ADD COLUMN sourceCategory TEXT;
