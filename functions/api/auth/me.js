import { requireAdmin } from "../../_lib/auth.js";
import { json } from "../../_lib/http.js";
import { describeAccess, ensureRbac, PERMISSIONS } from "../../_lib/rbac.js";
import { getUserById } from "../../_lib/users.js";

export async function onRequestGet(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ authenticated: false }, 401);

  let avatarUrl = null;
  let displayName = session.displayName;
  let role = session.role === "staff" ? "editor" : session.role;
  let username = session.username;
  let id = session.id;

  if (context.env.DB && session.id && session.id !== "env-admin") {
    try {
      await ensureRbac(context.env.DB);
      const user = await getUserById(context.env.DB, session.id);
      if (!user || user.active === false) return json({ authenticated: false }, 401);
      avatarUrl = user.avatarUrl;
      displayName = user.displayName;
      role = user.role === "staff" ? "editor" : user.role;
      username = user.username;
      id = user.id;
    } catch (error) {
      if (error.code === "RBAC_SCHEMA") return json({ error: error.message }, 500);
      console.error("load session user failed", error);
    }
  }

  let access = {
    roleName: role === "admin" ? "管理者" : "編輯者",
    permissions: role === "admin" ? PERMISSIONS.map((item) => item.key) : [],
    menus: []
  };

  if (context.env.DB) {
    try {
      await ensureRbac(context.env.DB);
      access = await describeAccess(context.env.DB, role);
    } catch (error) {
      if (error.code === "RBAC_SCHEMA") return json({ error: error.message }, 500);
      console.error("describe access failed", error);
    }
  }

  return json({
    authenticated: true,
    id,
    username,
    displayName,
    role: access.role || role,
    roleName: access.roleName,
    permissions: access.permissions,
    menus: access.menus,
    avatarUrl
  });
}
