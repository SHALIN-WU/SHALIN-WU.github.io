export const LOCALES = ["en", "zh-tw", "ja", "vi"];

export const CONTENT_FIELDS = [
  { key: "home.hero.eyebrow", label: "首頁 Hero 眉題", group: "首頁", multiline: false },
  { key: "home.hero.title", label: "首頁 Hero 標題", group: "首頁", multiline: false },
  { key: "home.hero.accent", label: "首頁 Hero 標題斜體", group: "首頁", multiline: false },
  { key: "home.hero.lead", label: "首頁 Hero 副標", group: "首頁", multiline: true },
  { key: "site.phone", label: "頁尾電話", group: "聯絡資訊", multiline: false },
  { key: "site.email", label: "總部信箱", group: "聯絡資訊", multiline: false }
];

const FIELD_KEYS = new Set(CONTENT_FIELDS.map((field) => field.key));
const MAX_LEN = 2000;

export function normalizeLocale(value) {
  const locale = String(value || "").trim().toLowerCase();
  return LOCALES.includes(locale) ? locale : "";
}

export async function readContent(db) {
  const result = await db.prepare("SELECT key, locale, value FROM content_blocks").all();
  const stored = new Map();
  for (const row of result.results || []) {
    stored.set(`${row.key}\0${row.locale}`, row.value || "");
  }
  return CONTENT_FIELDS.map((field) => ({
    key: field.key,
    label: field.label,
    group: field.group,
    multiline: field.multiline,
    values: Object.fromEntries(LOCALES.map((locale) => [locale, stored.get(`${field.key}\0${locale}`) || ""]))
  }));
}

function invalid(message) {
  return { ok: false, errors: [message], items: [] };
}

export function parseContentPut(body) {
  const items = body?.items;
  if (!Array.isArray(items)) return invalid("請提供 items");

  const errors = [];
  const next = [];
  const seen = new Set();

  for (const item of items) {
    const key = String(item?.key || "");
    if (!FIELD_KEYS.has(key)) {
      errors.push("未知的內容欄位");
      continue;
    }
    if (seen.has(key)) {
      errors.push("內容欄位重複");
      continue;
    }
    seen.add(key);

    const values = item?.values;
    if (!values || typeof values !== "object") {
      errors.push("缺少語系內容");
      continue;
    }

    const normalized = {};
    for (const locale of LOCALES) {
      if (!Object.prototype.hasOwnProperty.call(values, locale)) {
        errors.push("四種語系都要提供");
        break;
      }
      if (typeof values[locale] !== "string") {
        errors.push("內容必須是文字");
        break;
      }
      const value = values[locale].trim();
      if (value.length > MAX_LEN) {
        errors.push("內容超過 2000 字");
        break;
      }
      if (key === "site.email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push("總部信箱格式不正確");
        break;
      }
      if (key === "site.phone" && value && !/^[0-9+().\-\s]{6,40}$/.test(value)) {
        errors.push("電話格式不正確");
        break;
      }
      normalized[locale] = value;
    }
    next.push({ key, values: normalized });
  }

  if (!errors.length && seen.size !== CONTENT_FIELDS.length) {
    errors.push("請一次送出全部欄位");
  }

  return { ok: errors.length === 0, errors, items: next };
}

export async function saveContent(db, items, userId) {
  const now = new Date().toISOString();
  const statement = db.prepare(`INSERT INTO content_blocks (key, locale, value, updated_by, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(key, locale) DO UPDATE SET
      value = excluded.value,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at`);
  const batch = [];
  for (const item of items) {
    for (const locale of LOCALES) {
      batch.push(statement.bind(item.key, locale, item.values[locale], userId || null, now));
    }
  }
  await db.batch(batch);
  return readContent(db);
}

export async function publicBlocks(db, locale) {
  const result = await db
    .prepare("SELECT key, value FROM content_blocks WHERE locale = ? AND trim(value) != ''")
    .bind(locale)
    .all();
  const blocks = {};
  for (const row of result.results || []) {
    if (!FIELD_KEYS.has(row.key)) continue;
    blocks[row.key] = row.value;
  }
  return blocks;
}
