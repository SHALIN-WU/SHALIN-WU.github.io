import { parseCookies } from "./http.js";
import { hashPassword, timingSafeEqual, verifyPassword } from "./password.js";
import { countUsers, createUser, getUserByUsername, touchLastLogin } from "./users.js";

const COOKIE_NAME = "ng_admin_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 12;

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

function serializeCookie(name, value, options) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge != null) parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join("; ");
}

export async function createSessionCookie(env, user) {
  const config = getAuthConfig(env);
  const body = encodeJson({
    id: user.id,
    u: user.username,
    name: user.displayName || user.username,
    role: user.role || "staff",
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
    return {
      id: data.id || null,
      username: data.u,
      displayName: data.name || data.u,
      role: data.role || "staff"
    };
  } catch {
    return null;
  }
}

async function verifyEnvBootstrap(env, username, password) {
  const config = getAuthConfig(env);
  const userOk = timingSafeEqual(String(username || ""), config.username);
  if (!userOk) {
    await verifyPassword(password || "x", await hashPassword("dummy-check"));
    return false;
  }
  if (config.passwordHash) return verifyPassword(password, config.passwordHash);
  return verifyPassword(password, config.password);
}

export async function authenticateUser(env, username, password) {
  const normalized = String(username || "").trim().toLowerCase();
  if (!normalized || !password) return null;

  if (env.DB) {
    const existing = await getUserByUsername(env.DB, normalized);
    if (existing) {
      if (!existing.active) return null;
      const ok = await verifyPassword(password, existing.passwordHash);
      if (!ok) return null;
      await touchLastLogin(env.DB, existing.id);
      return {
        id: existing.id,
        username: existing.username,
        displayName: existing.displayName,
        role: existing.role
      };
    }

    const total = await countUsers(env.DB);
    if (total === 0) {
      const bootOk = await verifyEnvBootstrap(env, username, password);
      if (!bootOk) return null;
      const created = await createUser(env.DB, {
        username: getAuthConfig(env).username,
        displayName: "系統管理員",
        email: "",
        role: "admin",
        password,
        active: true
      });
      await touchLastLogin(env.DB, created.id);
      return {
        id: created.id,
        username: created.username,
        displayName: created.displayName,
        role: created.role
      };
    }
    return null;
  }

  const bootOk = await verifyEnvBootstrap(env, username, password);
  if (!bootOk) return null;
  const config = getAuthConfig(env);
  return {
    id: "env-admin",
    username: config.username,
    displayName: "系統管理員",
    role: "admin"
  };
}

export async function requireAdmin(request, env) {
  return readSession(request, env);
}

export function requireRole(session, roles = ["admin"]) {
  if (!session) return false;
  return roles.includes(session.role);
}

export { hashPassword, verifyPassword };
