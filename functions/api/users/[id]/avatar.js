import { authorize } from "../../../_lib/rbac.js";
import { requireAdmin } from "../../../_lib/auth.js";
import { decodeBase64 } from "../../../_lib/avatar.js";
import { json, readJson } from "../../../_lib/http.js";
import { clearUserAvatar, getUserAvatarBinary, setUserAvatar } from "../../../_lib/users.js";

export async function onRequestGet(context) {
  // Avatars are used inside the authenticated admin UI; allow session users.
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const avatar = await getUserAvatarBinary(context.env.DB, context.params.id);
  if (!avatar) return json({ error: "Not found" }, 404);

  const bytes = decodeBase64(avatar.base64);
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": avatar.mime,
      "Cache-Control": "private, max-age=3600",
      "Content-Length": String(bytes.byteLength)
    }
  });
}

export async function onRequestPut(context) {
  const gate = await authorize(context, "users.write");
  const isSelf = gate.session && gate.session.id === context.params.id;
  if (!gate.session) return json({ error: "Unauthorized" }, 401);
  if (gate.response && !isSelf) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body?.avatarData) return json({ error: "請提供頭像圖片" }, 400);

  try {
    const item = await setUserAvatar(context.env.DB, context.params.id, body.avatarData);
    if (!item) return json({ error: "Not found" }, 404);
    return json({ item });
  } catch (error) {
    if (error.code === "INVALID_AVATAR" || error.code === "AVATAR_TOO_LARGE") {
      return json({ error: error.message }, 400);
    }
    console.error("set avatar failed", error);
    return json({ error: "無法更新頭像" }, 500);
  }
}

export async function onRequestDelete(context) {
  const gate = await authorize(context, "users.write");
  const isSelf = gate.session && gate.session.id === context.params.id;
  if (!gate.session) return json({ error: "Unauthorized" }, 401);
  if (gate.response && !isSelf) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const item = await clearUserAvatar(context.env.DB, context.params.id);
  if (!item) return json({ error: "Not found" }, 404);
  return json({ item });
}
