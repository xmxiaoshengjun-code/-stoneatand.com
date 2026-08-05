-- ============================================================
-- Seed: InquiryFormField default 7 field configurations (P0-05)
-- Date: 2026-08-04
-- Database: SQLite (scripts/qianfan-seed2.db)
-- ============================================================

INSERT OR IGNORE INTO InquiryFormField (fieldName, fieldLabel, fieldType, isRequired, isActive, sortOrder)
VALUES
  ('customerName', 'Name', 'text', 1, 1, 1),
  ('email', 'Email', 'email', 1, 1, 2),
  ('phone', 'Phone', 'tel', 0, 1, 3),
  ('company', 'Company', 'text', 0, 1, 4),
  ('country', 'Country', 'text', 0, 1, 5),
  ('quantity', 'Quantity', 'number', 0, 1, 6),
  ('message', 'Message', 'textarea', 1, 1, 7);
