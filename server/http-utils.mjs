import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

export function sendJson(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  res.end(payload);
}

export function sendText(res, status, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(text),
    "Cache-Control": "no-store"
  });
  res.end(text);
}

export async function readJsonBody(req, limit = 64 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      const error = new Error("Payload too large");
      error.code = "PAYLOAD_TOO_LARGE";
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

export function withCorsSafeHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
}

function safeJoin(root, requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const cleaned = decoded.replace(/^\/+/, "").replace(/\\/g, "/");
  const full = normalize(join(root, cleaned));
  const rootNormalized = normalize(root + sep);
  if (full !== normalize(root) && !full.startsWith(rootNormalized)) return null;
  return full;
}

function resolveFile(root, urlPath) {
  let filePath = safeJoin(root, urlPath);
  if (!filePath) return null;
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    const indexPath = join(filePath, "index.html");
    if (existsSync(indexPath)) return indexPath;
  }
  if (existsSync(filePath) && statSync(filePath).isFile()) return filePath;
  if (!extname(filePath)) {
    const htmlPath = `${filePath}.html`;
    if (existsSync(htmlPath) && statSync(htmlPath).isFile()) return htmlPath;
  }
  return null;
}

export function serveStatic(req, res, root, urlPath, { fallbackHtml } = {}) {
  const filePath = resolveFile(root, urlPath);
  if (!filePath) {
    if (fallbackHtml && existsSync(fallbackHtml)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      createReadStream(fallbackHtml).pipe(res);
      return true;
    }
    return false;
  }
  const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
  const cache = filePath.endsWith(".html") ? "no-store" : "public, max-age=3600";
  res.writeHead(200, { "Content-Type": type, "Cache-Control": cache });
  createReadStream(filePath).pipe(res);
  return true;
}

export function createRateLimiter({ windowMs, max }) {
  const hits = new Map();
  return function check(key) {
    const now = Date.now();
    const bucket = hits.get(key);
    if (!bucket || now > bucket.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, remaining: max - 1 };
    }
    bucket.count += 1;
    if (bucket.count > max) return { ok: false, remaining: 0 };
    return { ok: true, remaining: max - bucket.count };
  };
}
