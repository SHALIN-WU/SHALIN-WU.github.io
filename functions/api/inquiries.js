import { requireAdmin } from "../_lib/auth.js";
import { STATUSES } from "../_lib/catalog.js";
import { createInquiry, listInquiries } from "../_lib/db.js";
import { clientIp, json, noContent, readJson } from "../_lib/http.js";
import { parseInquiryPayload } from "../_lib/inquiry-fields.js";

const ALLOWED_ORIGINS = new Set([
  "https://shalin-wu.github.io",
  "https://northgo-73a.pages.dev"
]);

function corsHeaders(request) {
  const headers = { Vary: "Origin" };
  const origin = request.headers.get("Origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return headers;
  headers["Access-Control-Allow-Origin"] = origin;
  headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type";
  return headers;
}

function withCors(request, response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value);
  }
  const bodyless = response.status === 204 || response.status === 205 || response.status === 304;
  return new Response(bodyless ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
}

export async function onRequestGet(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const url = new URL(context.request.url);
  const result = await listInquiries(context.env.DB, {
    status: url.searchParams.get("status") || undefined,
    q: url.searchParams.get("q") || undefined,
    office: url.searchParams.get("office") || undefined,
    limit: url.searchParams.get("limit") || undefined,
    offset: url.searchParams.get("offset") || undefined
  });
  return json({ ...result, statuses: STATUSES });
}

export async function onRequestPost(context) {
  const session = await requireAdmin(context.request, context.env);
  const body = await readJson(context.request);
  if (!body) return withCors(context.request, json({ error: "Invalid JSON." }, 400));

  if (String(body.company_website || "").trim()) return withCors(context.request, noContent());
  if (!context.env.DB) return withCors(context.request, json({ error: "D1 database is not bound." }, 500));

  const parsed = parseInquiryPayload(body, { allowStatus: Boolean(session) });
  if (!parsed.ok) {
    return withCors(context.request, json({ error: parsed.errors[0] || "Missing required fields.", errors: parsed.errors }, 400));
  }

  try {
    const record = await createInquiry(context.env.DB, parsed.data, {
      userAgent: context.request.headers.get("user-agent") || "",
      ip: clientIp(context.request)
    });
    return withCors(context.request, json({ ok: true, id: record.id, reference: record.reference, item: record }, 201));
  } catch (error) {
    console.error("create inquiry failed", error);
    return withCors(context.request, json({ error: "Could not save enquiry." }, 500));
  }
}
