import { json, readJson } from "../../_lib/http.js";
import { authorize, deleteMenu, isInvalid, isUnique, updateMenu } from "../../_lib/rbac.js";

export async function onRequestPut(context) {
  const gate = await authorize(context, "menus.write");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  try {
    const item = await updateMenu(context.env.DB, context.params.id, body);
    if (!item) return json({ error: "Not found" }, 404);
    return json({ item });
  } catch (error) {
    if (isInvalid(error)) return json({ error: error.message }, 400);
    if (isUnique(error)) return json({ error: "選單代碼已存在" }, 409);
    console.error("update menu failed", error);
    return json({ error: "無法更新選單" }, 500);
  }
}

export async function onRequestDelete(context) {
  const gate = await authorize(context, "menus.write");
  if (gate.response) return gate.response;
  if (!context.env.DB) return json({ error: "D1 database is not bound." }, 500);

  try {
    const ok = await deleteMenu(context.env.DB, context.params.id);
    if (!ok) return json({ error: "Not found" }, 404);
    return json({ ok: true });
  } catch (error) {
    if (isInvalid(error)) return json({ error: error.message }, 400);
    console.error("delete menu failed", error);
    return json({ error: "無法刪除選單" }, 500);
  }
}
