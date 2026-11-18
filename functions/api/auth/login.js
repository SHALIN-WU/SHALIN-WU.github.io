import { createSessionCookie, verifyCredentials } from "../../_lib/auth.js";
import { json, readJson } from "../../_lib/http.js";

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  if (!username || !password) {
    return json({ error: "Username and password are required." }, 400);
  }

  const ok = await verifyCredentials(context.env, username, password);
  if (!ok) return json({ error: "Invalid username or password." }, 401);

  const cookie = await createSessionCookie(context.env);
  return json({ ok: true, username }, 200, { "Set-Cookie": cookie });
}
