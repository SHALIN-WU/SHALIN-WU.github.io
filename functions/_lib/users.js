import { hashPassword } from "./password.js";
import { parseDataUrl } from "./avatar.js";

export async function assertKnownRole(db, role) {
  const key = String(role || "").trim();
  const row = await db.prepare("SELECT key FROM admin_roles WHERE key = ?").bind(key).first();
  if (!row) {
    const error = new Error("Invalid role");
    error.code = "INVALID_ROLE";
    throw error;
  }
  return row.key;
}

export async function listRoleOptions(db) {
  const result = await db.prepare("SELECT key, name FROM admin_roles ORDER BY is_system DESC, name ASC").all();
  return (result.results || []).map((row) => ({ key: row.key, name: row.name }));
}

function mapUser(row, { includeAvatarData = false } = {}) {
  if (!row) return null;
  const hasAvatar = Number(row.has_avatar) === 1 || Boolean(row.avatar_data);
  const user = {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    email: row.email || "",
    role: row.role,
    roleName: row.role_name || "",
    active: Number(row.active) === 1,
    hasAvatar,
    avatarUrl: hasAvatar ? `/api/users/${row.id}/avatar?v=${encodeURIComponent(row.updated_at || "")}` : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at || null
  };
  if (includeAvatarData) {
    user.avatarData = row.avatar_data || "";
    user.avatarMime = row.avatar_mime || "";
  }
  return user;
}

export async function countUsers(db) {
  const row = await db.prepare("SELECT COUNT(*) AS total FROM admin_users").first();
  return Number(row?.total || 0);
}

export async function listUsers(db) {
  const result = await db
    .prepare(`SELECT u.id, u.username, u.display_name, u.email, u.role, u.active, u.created_at, u.updated_at, u.last_login_at,
      CASE WHEN u.avatar_data != '' THEN 1 ELSE 0 END AS has_avatar,
      r.name AS role_name
      FROM admin_users u
      LEFT JOIN admin_roles r ON r.key = u.role
      ORDER BY u.created_at ASC`)
    .all();
  return (result.results || []).map((row) => mapUser(row));
}

export async function getUserById(db, id, options) {
  const row = await db
    .prepare(`SELECT u.*, r.name AS role_name
      FROM admin_users u
      LEFT JOIN admin_roles r ON r.key = u.role
      WHERE u.id = ?`)
    .bind(id)
    .first();
  return mapUser(row, options);
}

export async function getUserByUsername(db, username) {
  const row = await db
    .prepare("SELECT * FROM admin_users WHERE lower(username) = lower(?)")
    .bind(String(username || "").trim())
    .first();
  return row ? { ...mapUser(row), passwordHash: row.password_hash } : null;
}

export async function createUser(db, input) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const passwordHash = input.passwordHash || (await hashPassword(input.password));
  let avatarData = "";
  let avatarMime = "";
  if (input.avatarData) {
    const parsed = parseDataUrl(input.avatarData);
    avatarData = parsed.base64;
    avatarMime = parsed.mime;
  }

  await db
    .prepare(`INSERT INTO admin_users (
      id, username, display_name, email, role, password_hash, active, created_at, updated_at, last_login_at, avatar_data, avatar_mime
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`)
    .bind(
      id,
      String(input.username).trim().toLowerCase(),
      String(input.displayName || input.username).trim(),
      String(input.email || "").trim().toLowerCase(),
      await assertKnownRole(db, input.role || "editor"),
      passwordHash,
      input.active === false ? 0 : 1,
      now,
      now,
      avatarData,
      avatarMime
    )
    .run();
  return getUserById(db, id);
}

export async function updateUser(db, id, patch = {}) {
  const current = await getUserById(db, id, { includeAvatarData: true });
  if (!current) return null;

  const next = {
    displayName: patch.displayName != null ? String(patch.displayName).trim() : current.displayName,
    email: patch.email != null ? String(patch.email).trim().toLowerCase() : current.email,
    role: patch.role != null ? await assertKnownRole(db, patch.role) : current.role,
    active: patch.active != null ? Boolean(patch.active) : current.active,
    updatedAt: new Date().toISOString()
  };

  if (patch.password) {
    const passwordHash = await hashPassword(patch.password);
    await db
      .prepare(`UPDATE admin_users SET
        display_name = ?, email = ?, role = ?, active = ?, password_hash = ?, updated_at = ?
        WHERE id = ?`)
      .bind(next.displayName, next.email, next.role, next.active ? 1 : 0, passwordHash, next.updatedAt, id)
      .run();
  } else {
    await db
      .prepare(`UPDATE admin_users SET
        display_name = ?, email = ?, role = ?, active = ?, updated_at = ?
        WHERE id = ?`)
      .bind(next.displayName, next.email, next.role, next.active ? 1 : 0, next.updatedAt, id)
      .run();
  }

  return getUserById(db, id);
}

export async function setUserAvatar(db, id, dataUrl) {
  const current = await getUserById(db, id);
  if (!current) return null;
  const parsed = parseDataUrl(dataUrl);
  const now = new Date().toISOString();
  await db
    .prepare("UPDATE admin_users SET avatar_data = ?, avatar_mime = ?, updated_at = ? WHERE id = ?")
    .bind(parsed.base64, parsed.mime, now, id)
    .run();
  return getUserById(db, id);
}

export async function clearUserAvatar(db, id) {
  const current = await getUserById(db, id);
  if (!current) return null;
  const now = new Date().toISOString();
  await db
    .prepare("UPDATE admin_users SET avatar_data = '', avatar_mime = '', updated_at = ? WHERE id = ?")
    .bind(now, id)
    .run();
  return getUserById(db, id);
}

export async function getUserAvatarBinary(db, id) {
  const row = await db
    .prepare("SELECT avatar_data, avatar_mime, updated_at FROM admin_users WHERE id = ?")
    .bind(id)
    .first();
  if (!row || !row.avatar_data) return null;
  return {
    mime: row.avatar_mime || "image/jpeg",
    base64: row.avatar_data,
    updatedAt: row.updated_at || ""
  };
}

export async function deleteUser(db, id) {
  const result = await db.prepare("DELETE FROM admin_users WHERE id = ?").bind(id).run();
  return (result.meta?.changes || 0) > 0;
}

export async function touchLastLogin(db, id) {
  const now = new Date().toISOString();
  await db.prepare("UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?")
    .bind(now, now, id)
    .run();
}

export async function countAdmins(db) {
  const row = await db
    .prepare("SELECT COUNT(*) AS total FROM admin_users WHERE role = 'admin' AND active = 1")
    .first();
  return Number(row?.total || 0);
}
