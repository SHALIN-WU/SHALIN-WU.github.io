import { requireAdmin, requireRole } from "../../_lib/auth.js";
import { json, readJson } from "../../_lib/http.js";
import { deletePage, isUniqueConflict, parsePageInput, updatePage } from "../../_lib/pages.js";

export async function onRequestPut(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!requireRole(session, ["admin"])) return json({ error: "需要管理員權限" }, 403);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);
  const parsed = parsePageInput(body);
  if (!parsed.ok) return json({ error: parsed.errors[0], errors: parsed.errors }, 400);

  try {
    const item = await updatePage(context.env.DB, context.params.id, parsed.data, session.id);
    if (!item) return json({ error: "Not found" }, 404);
    return json({ item });
  } catch (error) {
    if (isUniqueConflict(error)) return json({ error: "這個語系已有相同網址代碼" }, 409);
    console.error("update page failed", error);
    return json({ error: "無法更新頁面" }, 500);
  }
}

export async function onRequestDelete(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!requireRole(session, ["admin"])) return json({ error: "需要管理員權限" }, 403);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  try {
    const removed = await deletePage(context.env.DB, context.params.id);
    if (!removed) return json({ error: "Not found" }, 404);
    return json({ ok: true });
  } catch (error) {
    console.error("delete page failed", error);
    return json({ error: "無法刪除頁面" }, 500);
  }
}
