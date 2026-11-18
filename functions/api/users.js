import { requireAdmin, requireRole } from "../_lib/auth.js";
import { json, readJson } from "../_lib/http.js";
import { createUser, listUsers, ROLES } from "../_lib/users.js";

function validateUserInput(body, { requirePassword = true } = {}) {
  const errors = [];
  const username = String(body?.username || "").trim().toLowerCase();
  const displayName = String(body?.displayName || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const role = String(body?.role || "staff").trim();
  const password = String(body?.password || "");
  const active = body?.active === false ? false : true;

  if (!/^[a-z0-9._-]{3,32}$/.test(username)) errors.push("帳號需為 3–32 字元英數（可含 . _ -）");
  if (!displayName || displayName.length > 80) errors.push("顯示名稱必填");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Email 格式不正確");
  if (!ROLES.includes(role)) errors.push("角色不正確");
  if (requirePassword && password.length < 8) errors.push("密碼至少 8 碼");
  if (!requirePassword && password && password.length < 8) errors.push("密碼至少 8 碼");

  return {
    ok: errors.length === 0,
    errors,
    data: { username, displayName, email, role, password, active }
  };
}

export async function onRequestGet(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!requireRole(session, ["admin"])) return json({ error: "需要管理員權限" }, 403);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const items = await listUsers(context.env.DB);
  return json({ items, roles: ROLES });
}

export async function onRequestPost(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (!requireRole(session, ["admin"])) return json({ error: "需要管理員權限" }, 403);
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  const parsed = validateUserInput(body, { requirePassword: true });
  if (!parsed.ok) return json({ error: parsed.errors[0], errors: parsed.errors }, 400);

  try {
    const item = await createUser(context.env.DB, parsed.data);
    return json({ item }, 201);
  } catch (error) {
    if (String(error?.message || "").includes("UNIQUE")) {
      return json({ error: "帳號已存在" }, 409);
    }
    console.error("create user failed", error);
    return json({ error: "無法建立使用者" }, 500);
  }
}
