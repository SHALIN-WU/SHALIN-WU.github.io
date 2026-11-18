import { requireAdmin, requireRole } from "../../_lib/auth.js";
import { json, readJson } from "../../_lib/http.js";
import { countAdmins, deleteUser, getUserById, ROLES, updateUser } from "../../_lib/users.js";

function validatePatch(body) {
  const errors = [];
  const data = {};

  if (body.displayName != null) {
    const displayName = String(body.displayName).trim();
    if (!displayName || displayName.length > 80) errors.push("顯示名稱必填");
    else data.displayName = displayName;
  }
  if (body.email != null) {
    const email = String(body.email).trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Email 格式不正確");
    else data.email = email;
  }
  if (body.role != null) {
    if (!ROLES.includes(body.role)) errors.push("角色不正確");
    else data.role = body.role;
  }
  if (body.active != null) data.active = Boolean(body.active);
  if (body.password != null && body.password !== "") {
    if (String(body.password).length < 8) errors.push("密碼至少 8 碼");
    else data.password = String(body.password);
  }

  return { ok: errors.length === 0, errors, data };
}

export async function onRequestGet(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!requireRole(session, ["admin"])) return json({ error: "需要管理員權限" }, 403);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const item = await getUserById(context.env.DB, context.params.id);
  if (!item) return json({ error: "Not found" }, 404);
  return json({ item });
}

export async function onRequestPut(context) {
  return patchHandler(context);
}

export async function onRequestPatch(context) {
  return patchHandler(context);
}

async function patchHandler(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!requireRole(session, ["admin"])) return json({ error: "需要管理員權限" }, 403);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);
  const parsed = validatePatch(body);
  if (!parsed.ok) return json({ error: parsed.errors[0], errors: parsed.errors }, 400);

  const current = await getUserById(context.env.DB, context.params.id);
  if (!current) return json({ error: "Not found" }, 404);

  const nextRole = parsed.data.role ?? current.role;
  const nextActive = parsed.data.active ?? current.active;
  if (current.role === "admin" && current.active && (nextRole !== "admin" || nextActive === false)) {
    const admins = await countAdmins(context.env.DB);
    if (admins <= 1) return json({ error: "至少需保留一位啟用中的管理員" }, 400);
  }

  try {
    const item = await updateUser(context.env.DB, context.params.id, parsed.data);
    return json({ item });
  } catch (error) {
    if (error.code === "INVALID_ROLE") return json({ error: "角色不正確" }, 400);
    console.error("update user failed", error);
    return json({ error: "無法更新使用者" }, 500);
  }
}

export async function onRequestDelete(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!requireRole(session, ["admin"])) return json({ error: "需要管理員權限" }, 403);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const current = await getUserById(context.env.DB, context.params.id);
  if (!current) return json({ error: "Not found" }, 404);
  if (session.id && current.id === session.id) {
    return json({ error: "無法刪除目前登入的帳號" }, 400);
  }
  if (current.role === "admin" && current.active) {
    const admins = await countAdmins(context.env.DB);
    if (admins <= 1) return json({ error: "至少需保留一位啟用中的管理員" }, 400);
  }

  const ok = await deleteUser(context.env.DB, context.params.id);
  if (!ok) return json({ error: "Not found" }, 404);
  return json({ ok: true });
}
