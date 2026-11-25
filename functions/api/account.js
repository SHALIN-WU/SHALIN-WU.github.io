import { authorize } from "../_lib/rbac.js";
import { json, readJson } from "../_lib/http.js";
import { clearUserAvatar, getUserById, setUserAvatar, updateUser } from "../_lib/users.js";

export async function onRequestGet(context) {
  const gate = await authorize(context, "");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);
  if (!gate.session.id || gate.session.id === "env-admin") {
    return json({ error: "此帳號無法在這裡修改" }, 400);
  }

  const item = await getUserById(context.env.DB, gate.session.id);
  if (!item) return json({ error: "Not found" }, 404);
  return json({ item });
}

export async function onRequestPut(context) {
  const gate = await authorize(context, "");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);
  if (!gate.session.id || gate.session.id === "env-admin") {
    return json({ error: "此帳號無法在這裡修改" }, 400);
  }

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  const patch = {};
  if (body.displayName != null) {
    const displayName = String(body.displayName).trim();
    if (!displayName || displayName.length > 80) return json({ error: "顯示名稱必填" }, 400);
    patch.displayName = displayName;
  }
  if (body.email != null) {
    const email = String(body.email).trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Email 格式不正確" }, 400);
    patch.email = email;
  }
  if (body.password) {
    if (String(body.password).length < 8) return json({ error: "密碼至少 8 碼" }, 400);
    patch.password = String(body.password);
  }

  try {
    let item = await updateUser(context.env.DB, gate.session.id, patch);
    if (!item) return json({ error: "Not found" }, 404);
    if (body.removeAvatar) item = await clearUserAvatar(context.env.DB, gate.session.id);
    if (body.avatarData) item = await setUserAvatar(context.env.DB, gate.session.id, String(body.avatarData));
    return json({ item });
  } catch (error) {
    if (error.code === "INVALID_AVATAR" || error.code === "AVATAR_TOO_LARGE") {
      return json({ error: error.message }, 400);
    }
    const message = String(error?.message || "");
    if (message.includes("顯示名稱") || message.includes("Email") || message.includes("密碼")) {
      return json({ error: message }, 400);
    }
    console.error("update account failed", error);
    return json({ error: "無法更新帳號" }, 500);
  }
}
