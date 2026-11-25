export const MAX_BYTES = 4 * 1024 * 1024;
export const PUBLIC_MEDIA_ORIGIN = "https://northgo-73a.pages.dev";

const EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isMediaId(id) {
  return ID_RE.test(String(id || ""));
}

export function publicMediaUrl(id) {
  return `${PUBLIC_MEDIA_ORIGIN}/api/media/${id}`;
}

function fail(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeMime(value) {
  const mime = String(value || "").split(";")[0].trim().toLowerCase();
  if (!mime || mime === "application/octet-stream") return "";
  if (mime === "image/jpg" || mime === "image/pjpeg") return "image/jpeg";
  if (mime === "image/x-png") return "image/png";
  return mime;
}

function detectMime(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return "";
}

function cleanFilename(name, ext) {
  const raw = String(name || "").split(/[/\\]/).pop() || "";
  const cleaned = raw.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 180);
  return cleaned || `image${ext}`;
}

function cleanAlt(value) {
  const alt = String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (alt.length > 200) throw fail("替代文字最多 200 字", "INVALID_MEDIA");
  return alt;
}

export async function readImageUpload(file, altText) {
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
    throw fail("請選擇圖片檔案", "INVALID_MEDIA");
  }
  if (Number(file.size) > MAX_BYTES) throw fail("單檔需在 4 MB 以內", "MEDIA_TOO_LARGE");

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > MAX_BYTES) throw fail("單檔需在 4 MB 以內", "MEDIA_TOO_LARGE");
  if (!bytes.byteLength) throw fail("檔案是空的", "INVALID_MEDIA");

  const mime = detectMime(bytes);
  if (!EXT[mime]) throw fail("僅支援 JPEG、PNG、WebP", "INVALID_MEDIA");

  const declared = normalizeMime(file.type);
  if (declared && declared !== mime) throw fail("僅支援 JPEG、PNG、WebP", "INVALID_MEDIA");

  const ext = EXT[mime];
  return {
    bytes,
    mime,
    ext,
    filename: cleanFilename(file.name, ext),
    alt: cleanAlt(altText)
  };
}

function toPublic(row) {
  return {
    id: row.id,
    filename: row.filename,
    mime: row.mime,
    bytes: Number(row.bytes) || 0,
    alt: row.alt || "",
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    url: publicMediaUrl(row.id)
  };
}

function toRecord(row) {
  if (!row) return null;
  return toPublic(row);
}

export async function listMedia(db) {
  const result = await db
    .prepare(`SELECT id, r2_key, filename, mime, bytes, alt, created_by, created_at
      FROM media ORDER BY created_at DESC`)
    .all();
  return (result.results || []).map(toPublic);
}

export async function getMedia(db, id) {
  if (!isMediaId(id)) return null;
  const row = await db
    .prepare(`SELECT id, r2_key, filename, mime, bytes, alt, created_by, created_at
      FROM media WHERE id = ?`)
    .bind(id)
    .first();
  return toRecord(row);
}

export async function insertMedia(db, input) {
  const createdAt = new Date().toISOString();
  await db
    .prepare(`INSERT INTO media (id, r2_key, filename, mime, bytes, alt, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      input.id,
      input.id,
      input.filename,
      input.mime,
      input.byteLength,
      input.alt || "",
      input.createdBy || null,
      createdAt
    )
    .run();
  return getMedia(db, input.id);
}

export async function deleteMediaRow(db, id) {
  const result = await db.prepare("DELETE FROM media WHERE id = ?").bind(id).run();
  return (result.meta?.changes || 0) > 0;
}
