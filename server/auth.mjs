import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "ng_admin_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 12;
const SCRYPT_KEYLEN = 64;

function requiredEnv(name, fallback = "") {
  const value = process.env[name];
  if (value == null || value === "") return fallback;
  return value;
}

export function getAuthConfig() {
  const username = requiredEnv("ADMIN_USERNAME", "admin");
  const passwordHash = requiredEnv("ADMIN_PASSWORD_HASH", "");
  const password = requiredEnv("ADMIN_PASSWORD", "northgo-admin-change-me");
  const secret = requiredEnv("SESSION_SECRET", "dev-only-change-me-" + username);
  const secure = String(requiredEnv("COOKIE_SECURE", "false")).toLowerCase() === "true";
  return { username, passwordHash, password, secret, secure };
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(password), salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored) return false;
  if (stored.startsWith("scrypt$")) {
    const parts = stored.split("$");
    if (parts.length !== 3) return false;
    const [, salt, expected] = parts;
    const actual = scryptSync(String(password), salt, SCRYPT_KEYLEN).toString("hex");
    const left = Buffer.from(actual, "hex");
    const right = Buffer.from(expected, "hex");
    return left.length === right.length && timingSafeEqual(left, right);
  }
  const left = Buffer.from(String(password));
  const right = Buffer.from(String(stored));
  return left.length === right.length && timingSafeEqual(left, right);
}

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodeSession(data, secret) {
  const body = Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

function decodeSession(token, secret) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body, secret);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!data || typeof data !== "object") return null;
    if (!data.exp || Date.now() > Number(data.exp)) return null;
    if (!data.u) return null;
    return data;
  } catch {
    return null;
  }
}

const DUMMY_HASH = hashPassword("dummy-check");

export async function verifyCredentials(username, password) {
  const config = getAuthConfig();
  const userBuf = Buffer.from(String(username || ""));
  const expectedUser = Buffer.from(config.username);
  const userOk =
    userBuf.length === expectedUser.length &&
    timingSafeEqual(userBuf, expectedUser);

  if (!userOk) {
    verifyPassword(password || "x", DUMMY_HASH);
    return false;
  }

  if (config.passwordHash) return verifyPassword(password, config.passwordHash);
  return verifyPassword(password, config.password);
}

export function createSessionCookie() {
  const config = getAuthConfig();
  const token = encodeSession(
    {
      u: config.username,
      iat: Date.now(),
      exp: Date.now() + MAX_AGE_MS,
      n: randomBytes(8).toString("hex")
    },
    config.secret
  );
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "Lax",
      secure: config.secure,
      path: "/",
      maxAge: MAX_AGE_MS
    }
  };
}

export function clearSessionCookie() {
  const config = getAuthConfig();
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      sameSite: "Lax",
      secure: config.secure,
      path: "/",
      maxAge: 0
    }
  };
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  String(header).split(";").forEach((part) => {
    const eq = part.indexOf("=");
    if (eq < 1) return;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    out[key] = decodeURIComponent(value);
  });
  return out;
}

export function readSession(req) {
  const config = getAuthConfig();
  const cookies = parseCookies(req.headers.cookie);
  return decodeSession(cookies[COOKIE_NAME], config.secret);
}

export function serializeCookie(cookie) {
  const parts = [`${cookie.name}=${encodeURIComponent(cookie.value)}`];
  if (cookie.options.path) parts.push(`Path=${cookie.options.path}`);
  if (cookie.options.maxAge != null) {
    parts.push(`Max-Age=${Math.floor(cookie.options.maxAge / 1000)}`);
  }
  if (cookie.options.httpOnly) parts.push("HttpOnly");
  if (cookie.options.secure) parts.push("Secure");
  if (cookie.options.sameSite) parts.push(`SameSite=${cookie.options.sameSite}`);
  return parts.join("; ");
}

export { COOKIE_NAME };
