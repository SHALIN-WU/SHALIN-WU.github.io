-- Phase 1: editable public copy. Media and pages tables come in later migrations.
CREATE TABLE IF NOT EXISTS content_blocks (
  key TEXT NOT NULL,
  locale TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  updated_by TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (key, locale)
);

INSERT OR IGNORE INTO content_blocks (key, locale, value, updated_by, updated_at) VALUES
  ('home.hero.eyebrow', 'en', 'Northgo · Since 1988', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.eyebrow', 'zh-tw', 'Northgo · 自 1988 年', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.eyebrow', 'ja', 'Northgo · 1988年創業', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.eyebrow', 'vi', 'Northgo · Từ năm 1988', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.title', 'en', 'Making logistics effortless.', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.title', 'zh-tw', '讓物流變得輕鬆。', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.title', 'ja', '物流を、手間なく。', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.title', 'vi', 'Logistics dễ dàng hơn.', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.accent', 'en', 'effortless.', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.accent', 'zh-tw', '輕鬆', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.accent', 'ja', '手間なく', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.accent', 'vi', 'dễ dàng', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.lead', 'en', 'We believe logistics should be simple, intuitive, and straightforward to handle. With nearly forty years of experience, Northgo helps companies take the friction out of logistics and stay focused on growth.', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.lead', 'zh-tw', '我們相信物流應該簡單、直覺、好處理。憑藉將近四十年經驗，Northgo 協助企業減少物流摩擦、專注成長。', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.lead', 'ja', '物流は、シンプルで直感的、そして扱いやすいものであるべきだと考えています。およそ四十年の経験をもとに、Northgo は企業の物流上の摩擦を減らし、成長に集中できるよう支えます。', NULL, '2026-11-25T00:00:00.000Z'),
  ('home.hero.lead', 'vi', 'Chúng tôi tin logistics phải đơn giản, trực quan và dễ xử lý. Với gần bốn mươi năm kinh nghiệm, Northgo giúp doanh nghiệp giảm ma sát trong logistics và tập trung vào tăng trưởng.', NULL, '2026-11-25T00:00:00.000Z'),
  ('site.phone', 'en', '+886-2-2531-8677', NULL, '2026-11-25T00:00:00.000Z'),
  ('site.phone', 'zh-tw', '+886-2-2531-8677', NULL, '2026-11-25T00:00:00.000Z'),
  ('site.phone', 'ja', '+886-2-2531-8677', NULL, '2026-11-25T00:00:00.000Z'),
  ('site.phone', 'vi', '+886-2-2531-8677', NULL, '2026-11-25T00:00:00.000Z'),
  ('site.email', 'en', 'info.tpe@northgo.com', NULL, '2026-11-25T00:00:00.000Z'),
  ('site.email', 'zh-tw', 'info.tpe@northgo.com', NULL, '2026-11-25T00:00:00.000Z'),
  ('site.email', 'ja', 'info.tpe@northgo.com', NULL, '2026-11-25T00:00:00.000Z'),
  ('site.email', 'vi', 'info.tpe@northgo.com', NULL, '2026-11-25T00:00:00.000Z');
