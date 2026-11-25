-- Phase 3: dynamic pages. One row is one slug in one locale.
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0,
  updated_by TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE (slug, locale),
  CHECK (locale IN ('en', 'zh-tw', 'ja', 'vi')),
  CHECK (published IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_pages_updated_at ON pages (updated_at DESC);
