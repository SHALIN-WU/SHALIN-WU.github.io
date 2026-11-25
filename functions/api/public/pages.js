import { json } from "../../_lib/http.js";
import { getPublishedPage, normalizeLocale, normalizeSlug, slugError } from "../../_lib/pages.js";

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
  const params = new URL(context.request.url).searchParams;
  const locale = normalizeLocale(params.get("locale"));
  if (!locale) return withCors(context.request, json({ error: "Unsupported locale." }, 400));
  const slug = normalizeSlug(params.get("slug"));
  if (slugError(slug)) return withCors(context.request, json({ error: "Invalid slug." }, 400));
  if (!context.env.DB) return withCors(context.request, json({ error: "D1 database is not bound." }, 500));

  try {
    const page = await getPublishedPage(context.env.DB, slug, locale);
    if (!page) return withCors(context.request, json({ error: "Not found" }, 404));
    return withCors(context.request, json({ page }));
  } catch (error) {
    console.error("public page failed", error);
    return withCors(context.request, json({ error: "Could not load page." }, 500));
  }
}
