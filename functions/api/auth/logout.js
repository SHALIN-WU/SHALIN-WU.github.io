import { clearSessionCookie } from "../../_lib/auth.js";
import { json } from "../../_lib/http.js";

export async function onRequestPost(context) {
  const cookie = clearSessionCookie(context.env);
  return json({ ok: true }, 200, { "Set-Cookie": cookie });
}
