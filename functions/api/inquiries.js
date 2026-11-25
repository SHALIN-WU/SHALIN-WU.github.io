import { requireAdmin } from "../_lib/auth.js";
import { authorize } from "../_lib/rbac.js";
import { STATUSES } from "../_lib/catalog.js";
import { createInquiry, listInquiries, resolveAssignee } from "../_lib/db.js";
import { accessPayload, inquiryAccess } from "../_lib/inquiry-access.js";
import { clientIp, json, noContent, readJson } from "../_lib/http.js";
import { parseInquiryPayload } from "../_lib/inquiry-fields.js";
import { listUsers } from "../_lib/users.js";

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

function assigneeOptions(users) {
  return users
    .filter((user) => user.active)
    .map((user) => ({
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      role: user.role,
      roleName: user.roleName
    }));
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
}

export async function onRequestGet(context) {
  const gate = await authorize(context, "inquiries.read");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const access = inquiryAccess(gate.permissions);
  const url = new URL(context.request.url);
  const result = await listInquiries(context.env.DB, {
    status: url.searchParams.get("status") || undefined,
    q: url.searchParams.get("q") || undefined,
    office: url.searchParams.get("office") || undefined,
    assigneeId: access.ownOnly ? gate.session.id : undefined,
    limit: url.searchParams.get("limit") || undefined,
    offset: url.searchParams.get("offset") || undefined
  });
  const assignees = access.canAssign ? assigneeOptions(await listUsers(context.env.DB)) : [];
  return json({
    ...result,
    statuses: STATUSES,
    canEdit: access.canEdit,
    access: accessPayload(access),
    assignees
  });
}

export async function onRequestPost(context) {
  const session = await requireAdmin(context.request, context.env);
  let access = null;
  let actor = null;
  if (session) {
    const gate = await authorize(context, null);
    if (gate.response) return withCors(context.request, gate.response);
    actor = gate.session;
    access = inquiryAccess(gate.permissions);
    if (!access.canCreate) {
      return withCors(context.request, json({ error: "沒有權限" }, 403));
    }
  }

  const body = await readJson(context.request);
  if (!body) return withCors(context.request, json({ error: "Invalid JSON." }, 400));

  if (String(body.company_website || "").trim()) return withCors(context.request, noContent());
  if (!context.env.DB) return withCors(context.request, json({ error: "D1 database is not bound." }, 500));

  const allowStatus = Boolean(access && (access.canWrite || access.canProgress));
  const parsed = parseInquiryPayload(body, { allowStatus });
  if (!parsed.ok) {
    return withCors(context.request, json({ error: parsed.errors[0] || "Missing required fields.", errors: parsed.errors }, 400));
  }

  try {
    if (access?.canProgress) {
      const status = parsed.data.status || "new";
      if (status !== "new" && status !== "in_progress") {
        return withCors(context.request, json({ error: "客服不能把狀態改成已回覆" }, 403));
      }
      parsed.data.status = status;
      parsed.data.assigneeId = await resolveAssignee(context.env.DB, actor.id);
    } else if (access?.canAssign && body.assigneeId != null && String(body.assigneeId).trim()) {
      parsed.data.assigneeId = await resolveAssignee(context.env.DB, body.assigneeId);
    }

    const record = await createInquiry(context.env.DB, parsed.data, {
      userAgent: context.request.headers.get("user-agent") || "",
      ip: clientIp(context.request)
    });
    return withCors(context.request, json({ ok: true, id: record.id, reference: record.reference, item: record }, 201));
  } catch (error) {
    if (error.code === "INVALID_ASSIGNEE") return withCors(context.request, json({ error: error.message }, 400));
    console.error("create inquiry failed", error);
    return withCors(context.request, json({ error: "Could not save enquiry." }, 500));
  }
}
