import { json, readJson } from "../_lib/http.js";
import {
  authorize,
  createMenu,
  isInvalid,
  isUnique,
  listMenus,
  permissionCatalog,
  reorderMenus
} from "../_lib/rbac.js";

export async function onRequestGet(context) {
  const gate = await authorize(context, "menus.read");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  try {
    const items = await listMenus(context.env.DB);
    return json({
      items,
      permissions: permissionCatalog(),
      canEdit: gate.permissions.includes("menus.write")
    });
  } catch (error) {
    console.error("list menus failed", error);
    return json({ error: "無法讀取選單" }, 500);
  }
}

export async function onRequestPost(context) {
  const gate = await authorize(context, "menus.write");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  try {
    const item = await createMenu(context.env.DB, body);
    return json({ item }, 201);
  } catch (error) {
    if (isInvalid(error)) return json({ error: error.message }, 400);
    if (isUnique(error)) return json({ error: "選單代碼已存在" }, 409);
    console.error("create menu failed", error);
    return json({ error: "無法建立選單" }, 500);
  }
}

export async function onRequestPut(context) {
  const gate = await authorize(context, "menus.write");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  try {
    await reorderMenus(context.env.DB, body?.parentId || "", body?.ids || []);
    return json({ items: await listMenus(context.env.DB) });
  } catch (error) {
    if (isInvalid(error)) return json({ error: error.message }, 400);
    console.error("reorder menus failed", error);
    return json({ error: "無法排序選單" }, 500);
  }
}
