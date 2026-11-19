import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  clearSessionCookie,
  createSessionCookie,
  readSession,
  serializeCookie,
  verifyCredentials
} from "./auth.mjs";
import { LOCALES, OFFICES, SERVICES } from "./catalog.mjs";
import {
  createInquiry,
  deleteInquiry,
  getInquiry,
  listInquiries,
  listStatuses,
  updateInquiry
} from "./db.mjs";
import {
  createRateLimiter,
  readJsonBody,
  sendJson,
  sendText,
  serveStatic,
  withCorsSafeHeaders
} from "./http-utils.mjs";
import { parseInquiryPayload } from "./inquiry-fields.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DIR = path.join(ROOT, "site");
const ADMIN_DIR = path.join(ROOT, "admin");
const PORT = Number(process.env.PORT || 3000);

loadEnvFile(path.join(ROOT, ".env"));

const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });
const enquiryLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 });

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "";
}

function requireAdmin(req, res) {
  const session = readSession(req);
  if (!session) {
    sendJson(res, 401, { error: "Unauthorized" });
    return null;
  }
  return session;
}

async function readBody(req, res) {
  try {
    return await readJsonBody(req);
  } catch (error) {
    if (error.code === "PAYLOAD_TOO_LARGE") {
      sendJson(res, 413, { error: "Payload too large." });
      return null;
    }
    sendJson(res, 400, { error: "Invalid JSON." });
    return null;
  }
}

async function handleApi(req, res, url) {
  const pathname = url.pathname;

  if (req.method === "GET" && pathname === "/api/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && pathname === "/api/auth/me") {
    const session = readSession(req);
    if (!session) return sendJson(res, 401, { authenticated: false });
    return sendJson(res, 200, { authenticated: true, username: session.u });
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const limited = loginLimiter(clientIp(req));
    if (!limited.ok) return sendJson(res, 429, { error: "Too many login attempts. Try again later." });
    let body;
    try {
      body = await readJsonBody(req);
    } catch (error) {
      if (error.code === "PAYLOAD_TOO_LARGE") return sendJson(res, 413, { error: "Payload too large." });
      return sendJson(res, 400, { error: "Invalid JSON." });
    }
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    if (!username || !password) {
      return sendJson(res, 400, { error: "Username and password are required." });
    }
    const ok = await verifyCredentials(username, password);
    if (!ok) return sendJson(res, 401, { error: "Invalid username or password." });
    const cookie = createSessionCookie();
    return sendJson(res, 200, { ok: true, username }, {
      "Set-Cookie": serializeCookie(cookie)
    });
  }

  if (req.method === "POST" && pathname === "/api/auth/logout") {
    const cookie = clearSessionCookie();
    return sendJson(res, 200, { ok: true }, {
      "Set-Cookie": serializeCookie(cookie)
    });
  }

  if (req.method === "GET" && pathname === "/api/meta") {
    if (!requireAdmin(req, res)) return;
    return sendJson(res, 200, {
      offices: OFFICES,
      services: SERVICES,
      locales: LOCALES,
      statuses: listStatuses()
    });
  }

  if (req.method === "POST" && pathname === "/api/inquiries") {
    const adminSession = readSession(req);
    if (!adminSession) {
      const limited = enquiryLimiter(clientIp(req));
      if (!limited.ok) return sendJson(res, 429, { error: "Too many enquiries. Try again later." });
    }

    const body = await readBody(req, res);
    if (!body) return;

    if (String(body.company_website || "").trim()) {
      res.writeHead(204);
      return res.end();
    }

    const parsed = parseInquiryPayload(body, { allowStatus: Boolean(adminSession) });
    if (!parsed.ok) {
      return sendJson(res, 400, { error: parsed.errors[0] || "Missing required fields.", errors: parsed.errors });
    }

    try {
      const record = await createInquiry(parsed.data, {
        userAgent: req.headers["user-agent"] || "",
        ip: clientIp(req)
      });
      return sendJson(res, 201, { ok: true, id: record.id, reference: record.reference, item: record });
    } catch (error) {
      console.error("create inquiry failed", error);
      return sendJson(res, 500, { error: "Could not save enquiry." });
    }
  }

  if (pathname === "/api/inquiries" && req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    const result = await listInquiries({
      status: url.searchParams.get("status") || undefined,
      q: url.searchParams.get("q") || undefined,
      office: url.searchParams.get("office") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      offset: url.searchParams.get("offset") || undefined
    });
    return sendJson(res, 200, { ...result, statuses: listStatuses() });
  }

  const inquiryMatch = pathname.match(/^\/api\/inquiries\/([^/]+)$/);
  if (inquiryMatch) {
    const id = decodeURIComponent(inquiryMatch[1]);
    if (req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      const item = await getInquiry(id);
      if (!item) return sendJson(res, 404, { error: "Not found" });
      return sendJson(res, 200, { item });
    }
    if (req.method === "PUT" || req.method === "PATCH") {
      if (!requireAdmin(req, res)) return;
      const body = await readBody(req, res);
      if (!body) return;

      try {
        let patch = body;
        if (req.method === "PUT" || body.full === true || body.first != null) {
          const parsed = parseInquiryPayload(body, { allowStatus: true });
          if (!parsed.ok) {
            return sendJson(res, 400, { error: parsed.errors[0] || "Invalid fields.", errors: parsed.errors });
          }
          patch = parsed.data;
        } else {
          patch = {};
          if (body.status != null) {
            if (typeof body.status !== "string" || !body.status.trim()) {
              return sendJson(res, 400, { error: "狀態不正確" });
            }
            patch.status = body.status.trim();
          }
          if (body.notes != null) patch.notes = body.notes;
          if (!Object.keys(patch).length) {
            return sendJson(res, 400, { error: "No fields to update." });
          }
        }

        const item = await updateInquiry(id, patch);
        if (!item) return sendJson(res, 404, { error: "Not found" });
        return sendJson(res, 200, { item });
      } catch (error) {
        if (error.code === "INVALID_STATUS") return sendJson(res, 400, { error: "Invalid status." });
        console.error("update inquiry failed", error);
        return sendJson(res, 500, { error: "Could not update enquiry." });
      }
    }
    if (req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      const ok = await deleteInquiry(id);
      if (!ok) return sendJson(res, 404, { error: "Not found" });
      return sendJson(res, 200, { ok: true });
    }
  }

  return sendJson(res, 404, { error: "Not found" });
}

const server = http.createServer(async (req, res) => {
  withCorsSafeHeaders(res);
  const host = req.headers.host || `localhost:${PORT}`;
  const url = new URL(req.url || "/", `http://${host}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      return await handleApi(req, res, url);
    }

    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      return serveStatic(req, res, ADMIN_DIR, "/index.html");
    }

    if (url.pathname.startsWith("/admin/")) {
      const adminPath = url.pathname.slice("/admin".length) || "/index.html";
      const served = serveStatic(req, res, ADMIN_DIR, adminPath);
      if (served) return;
      return serveStatic(req, res, ADMIN_DIR, "/index.html");
    }

    const sitePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const served = serveStatic(req, res, SITE_DIR, sitePath, {
      fallbackHtml: path.join(SITE_DIR, "404.html")
    });
    if (served) return;
    return sendText(res, 404, "Not found");
  } catch (error) {
    console.error("request failed", error);
    if (!res.headersSent) sendJson(res, 500, { error: "Server error" });
    else res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Northgo server listening on http://localhost:${PORT}`);
  console.log(`Admin login: http://localhost:${PORT}/admin/login.html`);
});
