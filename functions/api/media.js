import { requireAdmin, requireRole } from "../_lib/auth.js";
import { json } from "../_lib/http.js";
import { insertMedia, listMedia, readImageUpload } from "../_lib/media.js";

export async function onRequestGet(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  try {
    const items = await listMedia(context.env.DB);
    return json({ items, canEdit: session.role === "admin" });
  } catch (error) {
    console.error("list media failed", error);
    return json({ error: "無法讀取媒體" }, 500);
  }
}

export async function onRequestPost(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!requireRole(session, ["admin"])) return json({ error: "需要管理員權限" }, 403);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);
  if (!context.env.MEDIA_KV) return json({ error: "KV namespace is not bound." }, 500);

  let form;
  try {
    form = await context.request.formData();
  } catch {
    return json({ error: "請用 multipart 上傳圖片" }, 400);
  }

  let upload;
  try {
    upload = await readImageUpload(form.get("file"), form.get("alt"));
  } catch (error) {
    if (error.code === "INVALID_MEDIA" || error.code === "MEDIA_TOO_LARGE") {
      return json({ error: error.message }, 400);
    }
    console.error("read media upload failed", error);
    return json({ error: "無法上傳圖片" }, 400);
  }

  const id = crypto.randomUUID();
  try {
    await context.env.MEDIA_KV.put(id, upload.bytes, {
      metadata: { contentType: upload.mime }
    });
  } catch (error) {
    console.error("put media object failed", error);
    return json({ error: "無法上傳圖片" }, 500);
  }

  try {
    const saved = await insertMedia(context.env.DB, {
      id,
      filename: upload.filename,
      mime: upload.mime,
      byteLength: upload.bytes.byteLength,
      alt: upload.alt,
      createdBy: session.id
    });
    return json({ item: saved }, 201);
  } catch (error) {
    console.error("insert media failed", error);
    try {
      await context.env.MEDIA_KV.delete(id);
    } catch (cleanupError) {
      console.error("cleanup media object failed", cleanupError);
    }
    return json({ error: "無法上傳圖片" }, 500);
  }
}
