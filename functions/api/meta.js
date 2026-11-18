import { LOCALES, OFFICES, SERVICES, STATUSES } from "../_lib/catalog.js";
import { requireAdmin } from "../_lib/auth.js";
import { json } from "../_lib/http.js";

export async function onRequestGet(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  return json({
    offices: OFFICES,
    services: SERVICES,
    locales: LOCALES,
    statuses: STATUSES
  });
}
