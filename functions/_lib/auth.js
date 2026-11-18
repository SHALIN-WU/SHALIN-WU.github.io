import { parseCookies } from "./http.js";

const COOKIE_NAME = "ng_admin_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 12;
const PBKDF2_ITERATIONS = 100000;

function envValue(env, name, fallback = "") {
  const value = env?.[name];
  if (value == null || value === "") return fallback;
  return String(value);
}

export function getAuthConfig(env) {
  return {
    username: envValue(env, "ADMIN_USERNAME", "admin"),
    passwordHash: envValue(env, "ADMIN_PASSWORD_HASH", ""),
    password: envValue(env, "ADMIN_PASSWORD", "northgo-admin-change-me"),
    secret: envValue(env, "SESSION_SECRET", "dev-only-change-me-admin"),
    secure: String(envValue(env, "COOKIE_SECURE", "true")).toLowerCase() === "true"
  };
}

function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  const clean = String(hex || "");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function timingSafeEqual(a, b) {
  const left = a instanceof Uint8Array ? a : new TextEncoder().encode(String(a));
  const right = b instanceof Uint8Array ? b : new TextEncoder().encode(String(b));
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

async function pbkdf2Hex(password, saltHex, iterations = PBKDF2_ITERATIONS) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(String(password)),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: hexToBytes(saltHex),
      iterations
    },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

export async function hashPassword(password) {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await pbkdf2Hex(password, salt);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${hash}`;
}

export async function verifyPassword(password, stored) {
  if (!stored) return false;
  if (stored.startsWith("pbkdf2$")) {
    const parts = stored.split("$");
    if (parts.length !== 4) return false;
    const iterations = Number(parts[1]);
    const salt = parts[2];
    const expected = parts[3];
    const actual = await pbkdf2Hex(password, salt, iterations);
    return timingSafeEqual(actual, expected);
  }
  return timingSafeEqual(String(password), String(stored));
}

async function sign(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function encodeJson(data) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(data)));
}

function decodeJson(value) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value)));
}

export async function createSessionCookie(env) {
  const config = getAuthConfig(env);
  const body = encodeJson({
    u: config.username,
    iat: Date.now(),
    exp: Date.now() + MAX_AGE_MS,
    n: bytesToHex(crypto.getRandomValues(new Uint8Array(8)))
  });
  const token = `${body}.${await sign(body, config.secret)}`;
  return serializeCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: config.secure,
    path: "/",
    maxAge: MAX_AGE_MS
  });
}

export function clearSessionCookie(env) {
  const config = getAuthConfig(env);
  return serializeCookie(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "Lax",
    secure: config.secure,
    path: "/",
    maxAge: 0
  });
}

function serializeCookie(name, value, options) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge != null) parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join("; ");
}

export async function readSession(request, env) {
  const config = getAuthConfig(env);
  const cookies = parseCookies(request.headers.get("Cookie"));
  const token = cookies[COOKIE_NAME];
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = await sign(body, config.secret);
  if (!timingSafeEqual(signature, expected)) return null;
  try {
    const data = decodeJson(body);
    if (!data?.u || !data?.exp || Date.now() > Number(data.exp)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function verifyCredentials(env, username, password) {
  const config = getAuthConfig(env);
  const userOk = timingSafeEqual(String(username || ""), config.username);
  if (!userOk) {
    await verifyPassword(password || "x", await hashPassword("dummy-check"));
    return false;
  }
  if (config.passwordHash) return verifyPassword(password, config.passwordHash);
  return verifyPassword(password, config.password);
}

export async function requireAdmin(request, env) {
  return readSession(request, env);
}
