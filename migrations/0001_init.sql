CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY NOT NULL,
  reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  locale TEXT NOT NULL DEFAULT 'en',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  service TEXT NOT NULL,
  service_label TEXT NOT NULL DEFAULT '',
  cargo TEXT NOT NULL,
  office TEXT NOT NULL,
  office_name TEXT NOT NULL DEFAULT '',
  office_email TEXT NOT NULL DEFAULT '',
  origin TEXT NOT NULL,
  destination TEXT NOT NULL DEFAULT '',
  pieces TEXT NOT NULL DEFAULT '',
  weight TEXT NOT NULL DEFAULT '',
  volume TEXT NOT NULL DEFAULT '',
  ready TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  user_agent TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_office ON inquiries (office);
CREATE INDEX IF NOT EXISTS idx_inquiries_reference ON inquiries (reference);
