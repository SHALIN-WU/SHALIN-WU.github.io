import { requireAdmin } from "../../_lib/auth.js";
import { json } from "../../_lib/http.js";
import { getUserById } from "../../_lib/users.js";

export async function onRequestGet(context) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return json({ authenticated: false }, 401);

  let avatarUrl = null;
  let displayName = session.displayName;
  let role = session.role;
  let username = session.username;

  if (context.env.DB && session.id && session.id !== "env-admin") {
    try {
      const user = await getUserById(context.env.DB, session.id);
      if (user) {
        avatarUrl = user.avatarUrl;
        displayName = user.displayName;
        role = user.role;
        username = user.username;
      }
    } catch (_) {}
  }

  return json({
    authenticated: true,
    id: session.id,
    username,
    displayName,
    role,
    avatarUrl
  });
}
