import { requireAdmin } from "../../_lib/auth.js";
import { json } from "../../_lib/http.js";

export async function onRequestGet(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ authenticated: false }, 401);
  return json({ authenticated: true, username: session.u });
}
