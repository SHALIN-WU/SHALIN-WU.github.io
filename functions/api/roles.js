import { json, readJson } from "../_lib/http.js";
import {
  authorize,
  createRole,
  isInvalid,
  isUnique,
  listRoles,
  permissionCatalog
} from "../_lib/rbac.js";

export async function onRequestGet(context) {
  const gate = await authorize(context, "roles.read");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  try {
    const items = await listRoles(context.env.DB);
    return json({
      items,
      permissions: permissionCatalog(),
      canEdit: gate.permissions.includes("roles.write")
    });
  } catch (error) {
    console.error("list roles failed", error);
    return json({ error: "無法讀取角色" }, 500);
  }
}

export async function onRequestPost(context) {
  const gate = await authorize(context, "roles.write");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  try {
    const item = await createRole(context.env.DB, body);
    return json({ item }, 201);
  } catch (error) {
    if (isInvalid(error)) return json({ error: error.message }, 400);
    if (isUnique(error)) return json({ error: "角色代碼已存在" }, 409);
    console.error("create role failed", error);
    return json({ error: "無法建立角色" }, 500);
  }
}
