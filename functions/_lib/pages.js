export const LOCALES = ["en", "zh-tw", "ja", "vi"];

const RESERVED = new Set([
  "admin",
  "api",
  "p",
  "assets",
  "en",
  "zh-tw",
  "ja",
  "vi",
  "news",
  "index",
  "sitemap",
  "robots",
  "about",
  "contact",
  "locations",
  "services",
  "industries",
  "legal",
  "freight-logistics",
  "ocean-freight",
  "air-freight",
  "land-transport",
  "customs-clearance",
  "project-logistics",
  "warehouse-logistics",
  "shipping-agency",
  "offshore-wind",
  "privacy-policy",
  "terms",
  "cookie-policy",
  "disclaimer"
]);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPageId(id) {
  return ID_RE.test(String(id || ""));
}

export function normalizeLocale(value) {
  const locale = String(value || "").trim().toLowerCase();
  return LOCALES.includes(locale) ? locale : "";
}

export function normalizeSlug(value) {
  return String(value || "").trim().toLowerCase();
}

export function slugError(slug) {
  if (!SLUG_RE.test(slug) || slug.length < 2 || slug.length > 48) {
    return "網址代碼需為 2–48 字元小寫英數，可用 - 連接";
  }
  if (RESERVED.has(slug)) return "這個網址代碼已保留";
  return "";
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

function lengthOf(value) {
  return Array.from(value).length;
}

export function parsePageInput(body) {
  const slug = normalizeSlug(body?.slug);
  const locale = normalizeLocale(body?.locale);
  const title = cleanText(body?.title).trim();
  const pageBody = cleanText(body?.body).trim();
  const errors = [];
  const slugMessage = slugError(slug);
  if (slugMessage) errors.push(slugMessage);
  if (!locale) errors.push("語系不正確");
  if (!title) errors.push("標題必填");
  else if (lengthOf(title) > 160) errors.push("標題最多 160 字");
  if (typeof body?.body !== "string" && body?.body != null) errors.push("內文必須是文字");
  if (lengthOf(pageBody) > 20000) errors.push("內文最多 20000 字");
  if (typeof body?.published !== "boolean") errors.push("發布狀態不正確");
  return {
    ok: errors.length === 0,
    errors,
    data: {
      slug,
      locale,
      title,
      body: pageBody,
      published: body?.published ? 1 : 0
    }
  };
}

export function isUniqueConflict(error) {
  const message = String(error?.message || error?.cause?.message || "");
  return message.includes("UNIQUE");
}

function toAdmin(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    locale: row.locale,
    title: row.title,
    body: row.body || "",
    published: Number(row.published) === 1,
    updatedBy: row.updated_by || null,
    updatedAt: row.updated_at
  };
}

function toPublic(row) {
  return {
    slug: row.slug,
    locale: row.locale,
    title: row.title,
    body: row.body || "",
    updatedAt: row.updated_at
  };
}

const COLUMNS = "id, slug, locale, title, body, published, updated_by, updated_at";

export async function listPages(db) {
  const result = await db
    .prepare(`SELECT ${COLUMNS} FROM pages ORDER BY updated_at DESC`)
    .all();
  return (result.results || []).map(toAdmin);
}

export async function getPage(db, id) {
  if (!isPageId(id)) return null;
  const row = await db.prepare(`SELECT ${COLUMNS} FROM pages WHERE id = ?`).bind(id).first();
  return toAdmin(row);
}

export async function getPublishedPage(db, slug, locale) {
  const row = await db
    .prepare(`SELECT ${COLUMNS} FROM pages WHERE slug = ? AND locale = ? AND published = 1`)
    .bind(slug, locale)
    .first();
  return row ? toPublic(row) : null;
}

export async function insertPage(db, input, updatedBy) {
  const id = crypto.randomUUID();
  const updatedAt = new Date().toISOString();
  await db
    .prepare(`INSERT INTO pages (id, slug, locale, title, body, published, updated_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, input.slug, input.locale, input.title, input.body, input.published, updatedBy || null, updatedAt)
    .run();
  return getPage(db, id);
}

export async function updatePage(db, id, input, updatedBy) {
  if (!isPageId(id)) return null;
  const updatedAt = new Date().toISOString();
  const result = await db
    .prepare(`UPDATE pages
      SET slug = ?, locale = ?, title = ?, body = ?, published = ?, updated_by = ?, updated_at = ?
      WHERE id = ?`)
    .bind(input.slug, input.locale, input.title, input.body, input.published, updatedBy || null, updatedAt, id)
    .run();
  if ((result.meta?.changes || 0) === 0) return null;
  return getPage(db, id);
}

export async function deletePage(db, id) {
  if (!isPageId(id)) return false;
  const result = await db.prepare("DELETE FROM pages WHERE id = ?").bind(id).run();
  return (result.meta?.changes || 0) > 0;
}
