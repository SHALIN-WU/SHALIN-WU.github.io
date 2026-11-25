import { requireAdmin, requireRole } from "../_lib/auth.js";
import { LOCALES, parseContentPut, readContent, saveContent } from "../_lib/content.js";
import { json, readJson } from "../_lib/http.js";

export async function onRequestGet(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  try {
    const keys = await readContent(context.env.DB);
    return json({ locales: LOCALES, keys, canEdit: session.role === "admin" });
  } catch (error) {
    console.error("list content failed", error);
    return json({ error: "無法讀取網站內容" }, 500);
  }
}

export async function onRequestPut(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!requireRole(session, ["admin"])) return json({ error: "需要管理員權限" }, 403);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  const parsed = parseContentPut(body);
  if (!parsed.ok) return json({ error: parsed.errors[0], errors: parsed.errors }, 400);

  try {
    const keys = await saveContent(context.env.DB, parsed.items, session.id);
    return json({ locales: LOCALES, keys, canEdit: true });
  } catch (error) {
    console.error("save content failed", error);
    return json({ error: "無法儲存網站內容" }, 500);
  }
}
