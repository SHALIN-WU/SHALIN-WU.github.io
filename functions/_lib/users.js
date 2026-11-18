import { hashPassword } from "./password.js";

export const ROLES = ["admin", "staff"];

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    email: row.email || "",
    role: row.role,
    active: Number(row.active) === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at || null
  };
}

export async function countUsers(db) {
  const row = await db.prepare("SELECT COUNT(*) AS total FROM admin_users").first();
  return Number(row?.total || 0);
}

export async function listUsers(db) {
  const result = await db
    .prepare("SELECT * FROM admin_users ORDER BY created_at ASC")
    .all();
  return (result.results || []).map(mapUser);
}

export async function getUserById(db, id) {
  const row = await db.prepare("SELECT * FROM admin_users WHERE id = ?").bind(id).first();
  return mapUser(row);
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
  await db
    .prepare(`INSERT INTO admin_users (
      id, username, display_name, email, role, password_hash, active, created_at, updated_at, last_login_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`)
    .bind(
      id,
      String(input.username).trim().toLowerCase(),
      String(input.displayName || input.username).trim(),
      String(input.email || "").trim().toLowerCase(),
      ROLES.includes(input.role) ? input.role : "staff",
      passwordHash,
      input.active === false ? 0 : 1,
      now,
      now
    )
    .run();
  return getUserById(db, id);
}

export async function updateUser(db, id, patch = {}) {
  const current = await getUserById(db, id);
  if (!current) return null;

  const next = {
    displayName: patch.displayName != null ? String(patch.displayName).trim() : current.displayName,
    email: patch.email != null ? String(patch.email).trim().toLowerCase() : current.email,
    role: patch.role != null ? patch.role : current.role,
    active: patch.active != null ? Boolean(patch.active) : current.active,
    updatedAt: new Date().toISOString()
  };

  if (!ROLES.includes(next.role)) {
    const error = new Error("Invalid role");
    error.code = "INVALID_ROLE";
    throw error;
  }

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
