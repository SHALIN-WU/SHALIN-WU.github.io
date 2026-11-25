import { authorize } from "../../_lib/rbac.js";
import { deleteInquiry, getInquiry, resolveAssignee, updateInquiry } from "../../_lib/db.js";
import { json, readJson } from "../../_lib/http.js";
import { canSeeInquiry, hasRecordFields, inquiryAccess, statusChangeError } from "../../_lib/inquiry-access.js";
import { parseInquiryPayload } from "../../_lib/inquiry-fields.js";

export async function onRequestGet(context) {
  const gate = await authorize(context, "inquiries.read");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const access = inquiryAccess(gate.permissions);
  const item = await getInquiry(context.env.DB, context.params.id);
  if (!item || !canSeeInquiry(access, gate.session, item)) return json({ error: "Not found" }, 404);
  return json({ item });
}

export async function onRequestPut(context) {
  return updateHandler(context, true);
}

export async function onRequestPatch(context) {
  return updateHandler(context, false);
}

async function updateHandler(context, fullPreferred) {
  const gate = await authorize(context, "inquiries.read");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const access = inquiryAccess(gate.permissions);
  if (!access.canEdit) return json({ error: "沒有權限修改詢問" }, 403);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  const current = await getInquiry(context.env.DB, context.params.id);
  if (!current || !canSeeInquiry(access, gate.session, current)) return json({ error: "Not found" }, 404);

  try {
    const full = fullPreferred || body.full === true || body.first != null;
    if (full && !access.canEditFields) return json({ error: "只能修改狀態與備註" }, 403);
    if (body.assigneeId != null && !access.canAssign) return json({ error: "沒有權限指派負責人" }, 403);

    let patch = {};
    if (full) {
      const parsed = parseInquiryPayload(body, { allowStatus: true });
      if (!parsed.ok) {
        return json({ error: parsed.errors[0] || "Invalid fields.", errors: parsed.errors }, 400);
      }
      patch = parsed.data;
    } else {
      if (body.status != null) {
        if (typeof body.status !== "string" || !body.status.trim()) {
          return json({ error: "狀態不正確" }, 400);
        }
        patch.status = body.status.trim();
      }
      if (body.notes != null) patch.notes = String(body.notes).trim().slice(0, 4000);
      if (!Object.keys(patch).length && body.assigneeId == null) {
        return json({ error: "No fields to update." }, 400);
      }
    }

    const statusError = statusChangeError(access, current.status, patch.status);
    if (statusError) {
      const status = statusError === "狀態不正確" ? 400 : 403;
      return json({ error: statusError }, status);
    }

    if (access.canAssign && body.assigneeId != null) {
      patch.assigneeId = await resolveAssignee(context.env.DB, body.assigneeId, current.assigneeId);
    }

    const item = await updateInquiry(context.env.DB, context.params.id, patch);
    if (!item) return json({ error: "Not found" }, 404);
    return json({ item });
  } catch (error) {
    if (error.code === "INVALID_STATUS") return json({ error: "Invalid status." }, 400);
    if (error.code === "INVALID_ASSIGNEE") return json({ error: error.message }, 400);
    console.error("update inquiry failed", error);
    return json({ error: "Could not update enquiry." }, 500);
  }
}

export async function onRequestDelete(context) {
  const gate = await authorize(context, "inquiries.read");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const access = inquiryAccess(gate.permissions);
  const current = await getInquiry(context.env.DB, context.params.id);
  if (!current || !canSeeInquiry(access, gate.session, current)) return json({ error: "Not found" }, 404);
  if (!access.canDelete) return json({ error: "沒有權限刪除詢問" }, 403);

  const ok = await deleteInquiry(context.env.DB, context.params.id);
  if (!ok) return json({ error: "Not found" }, 404);
  return json({ ok: true });
}
