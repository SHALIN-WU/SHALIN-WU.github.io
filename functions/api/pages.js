import { requireAdmin, requireRole } from "../_lib/auth.js";
import { json, readJson } from "../_lib/http.js";
import { insertPage, isUniqueConflict, listPages, parsePageInput } from "../_lib/pages.js";

export async function onRequestGet(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  try {
    const items = await listPages(context.env.DB);
    return json({ items, canEdit: session.role === "admin" });
  } catch (error) {
    console.error("list pages failed", error);
    return json({ error: "無法讀取頁面" }, 500);
  }
}

export async function onRequestPost(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!requireRole(session, ["admin"])) return json({ error: "需要管理員權限" }, 403);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);
  const parsed = parsePageInput(body);
  if (!parsed.ok) return json({ error: parsed.errors[0], errors: parsed.errors }, 400);

  try {
    const item = await insertPage(context.env.DB, parsed.data, session.id);
    return json({ item }, 201);
  } catch (error) {
    if (isUniqueConflict(error)) return json({ error: "這個語系已有相同網址代碼" }, 409);
    console.error("insert page failed", error);
    return json({ error: "無法新增頁面" }, 500);
  }
}
