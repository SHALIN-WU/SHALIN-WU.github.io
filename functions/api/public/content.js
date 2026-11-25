import { normalizeLocale, publicBlocks } from "../../_lib/content.js";
import { json } from "../../_lib/http.js";

const ALLOWED_ORIGINS = new Set([
  "https://shalin-wu.github.io",
  "https://northgo-73a.pages.dev"
]);

function corsHeaders(request) {
  const headers = { Vary: "Origin" };
  const origin = request.headers.get("Origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return headers;
  headers["Access-Control-Allow-Origin"] = origin;
  headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type";
  return headers;
}

function withCors(request, response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value);
  }
  const bodyless = response.status === 204 || response.status === 205 || response.status === 304;
  return new Response(bodyless ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
}

export async function onRequestGet(context) {
  const locale = normalizeLocale(new URL(context.request.url).searchParams.get("locale"));
  if (!locale) return withCors(context.request, json({ error: "Unsupported locale." }, 400));
  if (!context.env.DB) return withCors(context.request, json({ error: "D1 database is not bound." }, 500));

  try {
    const blocks = await publicBlocks(context.env.DB, locale);
    return withCors(context.request, json({ locale, blocks }));
  } catch (error) {
    console.error("public content failed", error);
    return withCors(context.request, json({ error: "Could not load content." }, 500));
  }
}
