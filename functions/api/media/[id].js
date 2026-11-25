import { requireAdmin, requireRole } from "../../_lib/auth.js";
import { json } from "../../_lib/http.js";
import { deleteMediaRow, getMedia } from "../../_lib/media.js";

export async function onRequestGet(context) {
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);
  if (!context.env.MEDIA_KV) return json({ error: "KV namespace is not bound." }, 500);

  const record = await getMedia(context.env.DB, context.params.id);
  if (!record) return json({ error: "Not found" }, 404);

  const stored = await context.env.MEDIA_KV.getWithMetadata(record.id, { type: "arrayBuffer" });
  if (!stored?.value) return json({ error: "Not found" }, 404);

  const headers = {
    "Content-Type": record.mime || stored.metadata?.contentType || "application/octet-stream",
    "Content-Length": String(stored.value.byteLength),
    "Cache-Control": "public, max-age=300",
    "X-Content-Type-Options": "nosniff"
  };
  return new Response(stored.value, { status: 200, headers });
}

export async function onRequestDelete(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!requireRole(session, ["admin"])) return json({ error: "需要管理員權限" }, 403);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);
  if (!context.env.MEDIA_KV) return json({ error: "KV namespace is not bound." }, 500);

  const record = await getMedia(context.env.DB, context.params.id);
  if (!record) return json({ error: "Not found" }, 404);

  try {
    await context.env.MEDIA_KV.delete(record.id);
  } catch (error) {
    console.error("delete media object failed", error);
    return json({ error: "無法刪除圖片" }, 500);
  }

  try {
    const removed = await deleteMediaRow(context.env.DB, record.id);
    if (!removed) return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("delete media row failed", error);
    return json({ error: "圖片檔已刪除，但資料列刪除失敗" }, 500);
  }

  return json({ ok: true });
}
