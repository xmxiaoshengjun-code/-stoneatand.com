-- ============================================================
-- Seed: Default SiteSetting values for UEESHOP features
-- Date: 2026-08-04
-- Database: SQLite (scripts/qianfan-seed2.db)
-- ============================================================

INSERT OR IGNORE INTO SiteSetting (key, value)
VALUES
  ('siteFavicon', ''),
  ('gaTrackingId', ''),
  ('watermarkEnabled', 'false'),
  ('watermarkType', 'text'),
  ('watermarkText', 'TSIANFAN'),
  ('watermarkImage', ''),
  ('watermarkPosition', 'southeast'),
  ('watermarkOpacity', '50'),
  ('watermarkSize', '30'),
  ('copyProtectionEnabled', 'false'),
  ('enabledLocales', 'en,fr,de,it,es');
