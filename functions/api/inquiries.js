import { requireAdmin } from "../_lib/auth.js";
import { STATUSES } from "../_lib/catalog.js";
import { createInquiry, listInquiries } from "../_lib/db.js";
import { clientIp, json, noContent, readJson } from "../_lib/http.js";
import { parseInquiryPayload } from "../_lib/inquiry-fields.js";

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
  if (!body) return json({ error: "Invalid JSON." }, 400);

  if (String(body.company_website || "").trim()) return noContent();
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const parsed = parseInquiryPayload(body, { allowStatus: Boolean(session) });
  if (!parsed.ok) {
    return json({ error: parsed.errors[0] || "Missing required fields.", errors: parsed.errors }, 400);
  }

  try {
    const record = await createInquiry(context.env.DB, parsed.data, {
      userAgent: context.request.headers.get("user-agent") || "",
      ip: clientIp(context.request)
    });
    return json({ ok: true, id: record.id, reference: record.reference, item: record }, 201);
  } catch (error) {
    console.error("create inquiry failed", error);
    return json({ error: "Could not save enquiry." }, 500);
  }
}
