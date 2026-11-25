import { json, readJson } from "../_lib/http.js";
import { authorize } from "../_lib/rbac.js";
import { assertKnownRole, createUser, listRoleOptions, listUsers } from "../_lib/users.js";

async function validateUserInput(db, body, { requirePassword = true } = {}) {
  const errors = [];
  const username = String(body?.username || "").trim().toLowerCase();
  const displayName = String(body?.displayName || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const role = String(body?.role || "editor").trim();
  const password = String(body?.password || "");
  const active = body?.active === false ? false : true;

  if (!/^[a-z0-9._-]{3,32}$/.test(username)) errors.push("帳號需為 3–32 字元英數（可含 . _ -）");
  if (!displayName || displayName.length > 80) errors.push("顯示名稱必填");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Email 格式不正確");
  try {
    await assertKnownRole(db, role);
  } catch {
    errors.push("角色不正確");
  }
  if (requirePassword && password.length < 8) errors.push("密碼至少 8 碼");
  if (!requirePassword && password && password.length < 8) errors.push("密碼至少 8 碼");

  const data = { username, displayName, email, role, password, active };
  if (body?.avatarData) data.avatarData = String(body.avatarData);

  return {
    ok: errors.length === 0,
    errors,
    data
  };
}

export async function onRequestGet(context) {
  const gate = await authorize(context, "users.read");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const items = await listUsers(context.env.DB);
  const roles = await listRoleOptions(context.env.DB);
  return json({ items, roles, canEdit: gate.permissions.includes("users.write") });
}

export async function onRequestPost(context) {
  const gate = await authorize(context, "users.write");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  const parsed = await validateUserInput(context.env.DB, body, { requirePassword: true });
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
