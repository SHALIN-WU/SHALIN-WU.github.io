import { requireAdmin } from "../../_lib/auth.js";
import { deleteInquiry, getInquiry, updateInquiry } from "../../_lib/db.js";
import { json, readJson } from "../../_lib/http.js";
import { parseInquiryPayload } from "../../_lib/inquiry-fields.js";

export async function onRequestGet(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const item = await getInquiry(context.env.DB, context.params.id);
  if (!item) return json({ error: "Not found" }, 404);
  return json({ item });
}

export async function onRequestPut(context) {
  return updateHandler(context, true);
}

export async function onRequestPatch(context) {
  return updateHandler(context, false);
}

async function updateHandler(context, fullPreferred) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  try {
    let patch = body;
    if (fullPreferred || body.full === true || body.first != null) {
      const parsed = parseInquiryPayload(body, { allowStatus: true });
      if (!parsed.ok) {
        return json({ error: parsed.errors[0] || "Invalid fields.", errors: parsed.errors }, 400);
      }
      patch = parsed.data;
    } else {
      patch = {};
      if (body.status != null) {
        if (typeof body.status !== "string" || !body.status.trim()) {
          return json({ error: "狀態不正確" }, 400);
        }
        patch.status = body.status.trim();
      }
      if (body.notes != null) patch.notes = body.notes;
      if (!Object.keys(patch).length) {
        return json({ error: "No fields to update." }, 400);
      }
    }

    const item = await updateInquiry(context.env.DB, context.params.id, patch);
    if (!item) return json({ error: "Not found" }, 404);
    return json({ item });
  } catch (error) {
    if (error.code === "INVALID_STATUS") return json({ error: "Invalid status." }, 400);
    console.error("update inquiry failed", error);
    return json({ error: "Could not update enquiry." }, 500);
  }
}

export async function onRequestDelete(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const ok = await deleteInquiry(context.env.DB, context.params.id);
  if (!ok) return json({ error: "Not found" }, 404);
  return json({ ok: true });
}
