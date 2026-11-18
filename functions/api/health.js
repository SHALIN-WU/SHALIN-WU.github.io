import { json } from "../_lib/http.js";

export async function onRequestGet() {
  return json({ ok: true, platform: "cloudflare-pages", storage: "d1" });
}
