import { json } from "../_lib/http.js";

const VERSION = "2.7.0";

export async function onRequestGet() {
  return json({
    ok: true,
    platform: "cloudflare-pages",
    storage: "d1",
    version: VERSION
  });
}
