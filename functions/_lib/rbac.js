import { requireAdmin } from "./auth.js";
import { json } from "./http.js";

const STAMP = "2026-11-25T00:00:00.000Z";

export const PERMISSIONS = [
  { key: "inquiries.read", label: "檢視客戶詢問", group: "客戶詢問" },
  { key: "inquiries.write", label: "管理客戶詢問", group: "客戶詢問" },
  { key: "content.read", label: "檢視網站內容", group: "網站內容" },
  { key: "content.write", label: "編輯網站內容", group: "網站內容" },
  { key: "media.read", label: "檢視媒體", group: "媒體" },
  { key: "media.write", label: "管理媒體", group: "媒體" },
  { key: "pages.read", label: "檢視動態頁面", group: "動態頁面" },
  { key: "pages.write", label: "管理動態頁面", group: "動態頁面" },
  { key: "users.read", label: "檢視使用者", group: "使用者" },
  { key: "users.write", label: "管理使用者", group: "使用者" },
  { key: "menus.read", label: "檢視選單", group: "選單" },
  { key: "menus.write", label: "管理選單", group: "選單" },
  { key: "roles.read", label: "檢視角色", group: "角色" },
  { key: "roles.write", label: "管理角色", group: "角色" }
];

const PERMISSION_KEYS = PERMISSIONS.map((item) => item.key);
const EDITOR_PERMISSIONS = [
  "inquiries.read",
  "inquiries.write",
  "content.read",
  "media.read",
  "pages.read"
];

export const MENU_ICONS = ["folder", "inquiry", "content", "media", "pages", "users", "menus", "roles", "link"];

const MENU_SEED = [
  ["menu-content", null, "content-group", "內容管理", "", "folder", "", 10, 1, 1],
  ["menu-system", null, "system-group", "系統設定", "", "folder", "", 20, 1, 1],
  ["menu-inquiries", "menu-content", "inquiries", "客戶詢問", "/admin/", "inquiry", "inquiries.read", 10, 0, 1],
  ["menu-site-content", "menu-content", "content", "網站內容", "/admin/content.html", "content", "content.read", 20, 0, 1],
  ["menu-media", "menu-content", "media", "媒體", "/admin/media.html", "media", "media.read", 30, 0, 1],
  ["menu-pages", "menu-content", "pages", "動態頁面", "/admin/pages.html", "pages", "pages.read", 40, 0, 1],
  ["menu-users", "menu-system", "users", "使用者", "/admin/users.html", "users", "users.read", 10, 0, 1],
  ["menu-menus", "menu-system", "menus", "選單管理", "/admin/menus.html", "menus", "menus.read", 20, 0, 1],
  ["menu-roles", "menu-system", "roles", "角色權限", "/admin/roles.html", "roles", "roles.read", 30, 0, 1]
];

let ready = false;

function fail(message) {
  const error = new Error(message);
  error.code = "INVALID";
  throw error;
}

function normalizeRoleKey(roleKey) {
  return roleKey === "staff" ? "editor" : String(roleKey || "");
}

export function permissionCatalog() {
  return PERMISSIONS.map((item) => ({ key: item.key, label: item.label, group: item.group }));
}

function normalizePermissions(list, { all = false } = {}) {
  if (all) return [...PERMISSION_KEYS];
  const set = new Set((Array.isArray(list) ? list : []).filter((key) => PERMISSION_KEYS.includes(key)));
  for (const key of [...set]) {
    if (key.endsWith(".write")) set.add(key.replace(/\.write$/, ".read"));
  }
  return PERMISSION_KEYS.filter((key) => set.has(key));
}

export async function ensureRbac(db) {
  if (ready) return;
  const table = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'admin_roles'")
    .first();
  if (!table) {
    const error = new Error("尚未建立角色資料表，請先套用 migrations/0007_rbac.sql");
    error.code = "RBAC_SCHEMA";
    throw error;
  }

  const statements = [
    db.prepare(`INSERT OR IGNORE INTO admin_roles (id, key, name, description, is_system, created_at, updated_at)
      VALUES ('role-admin', 'admin', '管理者', '可使用全部後台功能，權限不可縮減。', 1, ?, ?)`).bind(STAMP, STAMP),
    db.prepare(`INSERT OR IGNORE INTO admin_roles (id, key, name, description, is_system, created_at, updated_at)
      VALUES ('role-editor', 'editor', '編輯者', '可處理客戶詢問，並檢視網站內容、媒體與動態頁面。', 1, ?, ?)`).bind(STAMP, STAMP),
    ...PERMISSION_KEYS.map((key) =>
      db.prepare("INSERT OR IGNORE INTO admin_role_permissions (role_id, permission) VALUES ('role-admin', ?)").bind(key)
    ),
    ...EDITOR_PERMISSIONS.map((key) =>
      db.prepare("INSERT OR IGNORE INTO admin_role_permissions (role_id, permission) VALUES ('role-editor', ?)").bind(key)
    ),
    ...MENU_SEED.map((row) =>
      db.prepare(`INSERT OR IGNORE INTO admin_menus (
        id, parent_id, key, label, href, icon, permission, sort_order, enabled, is_group, is_system, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`).bind(...row, STAMP, STAMP)
    ),
    db.prepare("UPDATE admin_users SET role = 'editor' WHERE role = 'staff'")
  ];
  await db.batch(statements);
  ready = true;
}

export async function permissionsFor(db, roleKey) {
  const key = normalizeRoleKey(roleKey);
  if (key === "admin") return [...PERMISSION_KEYS];
  const role = await db.prepare("SELECT id FROM admin_roles WHERE key = ?").bind(key).first();
  if (!role) return [];
  const rows = await db
    .prepare("SELECT permission FROM admin_role_permissions WHERE role_id = ?")
    .bind(role.id)
    .all();
  return normalizePermissions((rows.results || []).map((row) => row.permission));
}

function mapMenu(row) {
  return {
    id: row.id,
    parentId: row.parent_id || null,
    key: row.key,
    label: row.label,
    href: row.href || "",
    icon: row.icon || "link",
    permission: row.permission || "",
    sortOrder: Number(row.sort_order) || 0,
    enabled: Number(row.enabled) === 1,
    isGroup: Number(row.is_group) === 1,
    isSystem: Number(row.is_system) === 1
  };
}

export async function listMenus(db) {
  const rows = await db.prepare("SELECT * FROM admin_menus ORDER BY sort_order ASC, label ASC").all();
  return (rows.results || []).map(mapMenu);
}

export async function visibleMenuTree(db, permissions) {
  const allowed = new Set(permissions || []);
  const items = (await listMenus(db)).filter((item) => item.enabled);
  const visible = items.filter((item) => item.isGroup || !item.permission || allowed.has(item.permission));
  const roots = visible
    .filter((item) => !item.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, "zh-Hant"));

  return roots
    .map((item) => {
      if (!item.isGroup) {
        return {
          id: item.id,
          key: item.key,
          label: item.label,
          href: item.href,
          icon: item.icon,
          isGroup: false
        };
      }
      const children = visible
        .filter((child) => child.parentId === item.id && !child.isGroup)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, "zh-Hant"))
        .map((child) => ({
          id: child.id,
          key: child.key,
          label: child.label,
          href: child.href,
          icon: child.icon,
          isGroup: false
        }));
      return {
        id: item.id,
        key: item.key,
        label: item.label,
        icon: item.icon || "folder",
        isGroup: true,
        children
      };
    })
    .filter((item) => !item.isGroup || item.children.length > 0);
}

export async function describeAccess(db, roleKey) {
  const key = normalizeRoleKey(roleKey);
  const role = await db.prepare("SELECT key, name FROM admin_roles WHERE key = ?").bind(key).first();
  const permissions = await permissionsFor(db, key);
  const menus = await visibleMenuTree(db, permissions);
  return {
    role: role?.key || key,
    roleName: role?.name || key,
    permissions,
    menus
  };
}

async function actorFromSession(context, session) {
  if (!context.env.DB || !session?.id || session.id === "env-admin") {
    return { ...session, role: normalizeRoleKey(session.role || "admin") };
  }
  await ensureRbac(context.env.DB);
  const row = await context.env.DB
    .prepare("SELECT role, active FROM admin_users WHERE id = ?")
    .bind(session.id)
    .first();
  if (!row || Number(row.active) !== 1) return null;
  return { ...session, role: normalizeRoleKey(row.role) };
}

export async function authorize(context, permission) {
  const session = await requireAdmin(context.request, context.env);
  if (!session) return { session: null, permissions: [], response: json({ error: "Unauthorized" }, 401) };

  if (!context.env.DB) {
    const allowed = session.role === "admin" || session.id === "env-admin";
    const permissions = allowed ? [...PERMISSION_KEYS] : [];
    if (permission && !permissions.includes(permission)) {
      return { session, permissions, response: json({ error: "沒有權限" }, 403) };
    }
    return { session, permissions, response: null };
  }

  try {
    await ensureRbac(context.env.DB);
  } catch (error) {
    if (error.code === "RBAC_SCHEMA") {
      return { session, permissions: [], response: json({ error: error.message }, 500) };
    }
    throw error;
  }

  const actor = await actorFromSession(context, session);
  if (!actor) return { session: null, permissions: [], response: json({ error: "Unauthorized" }, 401) };

  const permissions = await permissionsFor(context.env.DB, actor.role);
  if (permission && !permissions.includes(permission)) {
    return { session: actor, permissions, response: json({ error: "沒有權限" }, 403) };
  }
  return { session: actor, permissions, response: null };
}

function mapRole(row, permissions, userCount) {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description || "",
    isSystem: Number(row.is_system) === 1,
    permissions: normalizePermissions(permissions, { all: row.key === "admin" }),
    userCount: Number(userCount) || 0
  };
}

export async function listRoles(db) {
  const roles = await db.prepare("SELECT * FROM admin_roles ORDER BY is_system DESC, name ASC").all();
  const perms = await db.prepare("SELECT role_id, permission FROM admin_role_permissions").all();
  const counts = await db.prepare("SELECT role, COUNT(*) AS total FROM admin_users GROUP BY role").all();
  const byRole = new Map();
  for (const row of perms.results || []) {
    if (!byRole.has(row.role_id)) byRole.set(row.role_id, []);
    byRole.get(row.role_id).push(row.permission);
  }
  const byKey = new Map((counts.results || []).map((row) => [row.role, Number(row.total) || 0]));
  return (roles.results || []).map((row) => mapRole(row, byRole.get(row.id) || [], byKey.get(row.key) || 0));
}

async function replacePermissions(db, roleId, permissions) {
  await db.prepare("DELETE FROM admin_role_permissions WHERE role_id = ?").bind(roleId).run();
  if (!permissions.length) return;
  await db.batch(
    permissions.map((key) =>
      db.prepare("INSERT INTO admin_role_permissions (role_id, permission) VALUES (?, ?)").bind(roleId, key)
    )
  );
}

export async function createRole(db, input) {
  const key = String(input?.key || "").trim().toLowerCase();
  const name = String(input?.name || "").trim();
  const description = String(input?.description || "").trim();
  if (!/^[a-z][a-z0-9-]{1,31}$/.test(key)) fail("角色代碼需為 2–32 字元小寫英數，並以字母開頭");
  if (!name || name.length > 40) fail("角色名稱必填");
  if (description.length > 160) fail("說明過長");
  if (key === "admin" || key === "staff" || key === "editor") fail("這個角色代碼已保留");

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const permissions = normalizePermissions(input?.permissions);
  await db
    .prepare(`INSERT INTO admin_roles (id, key, name, description, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, ?, ?)`)
    .bind(id, key, name, description, now, now)
    .run();
  await replacePermissions(db, id, permissions);
  const roles = await listRoles(db);
  return roles.find((role) => role.id === id) || null;
}

export async function updateRole(db, id, input) {
  const current = await db.prepare("SELECT * FROM admin_roles WHERE id = ?").bind(id).first();
  if (!current) return null;
  const name = input?.name != null ? String(input.name).trim() : current.name;
  const description = input?.description != null ? String(input.description).trim() : current.description || "";
  if (!name || name.length > 40) fail("角色名稱必填");
  if (description.length > 160) fail("說明過長");

  const now = new Date().toISOString();
  await db
    .prepare("UPDATE admin_roles SET name = ?, description = ?, updated_at = ? WHERE id = ?")
    .bind(name, description, now, id)
    .run();

  const permissions = current.key === "admin"
    ? [...PERMISSION_KEYS]
    : normalizePermissions(input?.permissions);
  await replacePermissions(db, id, permissions);
  const roles = await listRoles(db);
  return roles.find((role) => role.id === id) || null;
}

export async function deleteRole(db, id) {
  const current = await db.prepare("SELECT * FROM admin_roles WHERE id = ?").bind(id).first();
  if (!current) return false;
  if (Number(current.is_system) === 1) fail("系統角色不可刪除");
  const used = await db.prepare("SELECT COUNT(*) AS total FROM admin_users WHERE role = ?").bind(current.key).first();
  if (Number(used?.total || 0) > 0) fail("仍有使用者使用這個角色");
  await db.prepare("DELETE FROM admin_role_permissions WHERE role_id = ?").bind(id).run();
  await db.prepare("DELETE FROM admin_roles WHERE id = ?").bind(id).run();
  return true;
}

function isSafeHref(href) {
  if (!href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return href.length <= 200;
  return /^https:\/\/[^\s]+$/i.test(href) && href.length <= 300;
}

async function nextSort(db, parentId) {
  const row = await db
    .prepare("SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM admin_menus WHERE COALESCE(parent_id, '') = ?")
    .bind(parentId || "")
    .first();
  return Number(row?.max_sort || 0) + 10;
}

export async function createMenu(db, input) {
  const key = String(input?.key || "").trim().toLowerCase();
  const label = String(input?.label || "").trim();
  const isGroup = Boolean(input?.isGroup);
  if (!/^[a-z][a-z0-9-]{1,39}$/.test(key)) fail("選單代碼需為 2–40 字元小寫英數，並以字母開頭");
  if (!label || label.length > 40) fail("選單名稱必填");

  let parentId = isGroup ? "" : String(input?.parentId || "");
  if (parentId) {
    const parent = await db.prepare("SELECT id, is_group FROM admin_menus WHERE id = ?").bind(parentId).first();
    if (!parent || Number(parent.is_group) !== 1) fail("上層必須是群組");
  }

  const href = isGroup ? "" : String(input?.href || "").trim();
  if (!isGroup && !isSafeHref(href)) fail("連結需以 / 或 https:// 開頭");
  const permission = isGroup ? "" : String(input?.permission || "");
  if (permission && !PERMISSION_KEYS.includes(permission)) fail("權限不正確");
  const icon = isGroup ? "folder" : (MENU_ICONS.includes(input?.icon) ? input.icon : "link");
  const sortOrder = await nextSort(db, parentId);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db
    .prepare(`INSERT INTO admin_menus (
      id, parent_id, key, label, href, icon, permission, sort_order, enabled, is_group, is_system, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`)
    .bind(id, parentId || null, key, label, href, icon, permission, sortOrder, input?.enabled === false ? 0 : 1, isGroup ? 1 : 0, now, now)
    .run();

  const items = await listMenus(db);
  return items.find((item) => item.id === id) || null;
}

export async function updateMenu(db, id, input) {
  const current = await db.prepare("SELECT * FROM admin_menus WHERE id = ?").bind(id).first();
  if (!current) return null;
  const isGroup = Number(current.is_group) === 1;
  const isSystem = Number(current.is_system) === 1;
  const label = input?.label != null ? String(input.label).trim() : current.label;
  if (!label || label.length > 40) fail("選單名稱必填");

  let parentId = current.parent_id || "";
  if (!isGroup && input?.parentId !== undefined) parentId = String(input.parentId || "");
  if (isGroup) parentId = "";
  if (parentId) {
    if (parentId === id) fail("上層不正確");
    const parent = await db.prepare("SELECT id, is_group FROM admin_menus WHERE id = ?").bind(parentId).first();
    if (!parent || Number(parent.is_group) !== 1) fail("上層必須是群組");
  }

  let href = current.href || "";
  if (!isGroup && !isSystem && input?.href != null) href = String(input.href).trim();
  if (!isGroup && !isSafeHref(href)) fail("連結需以 / 或 https:// 開頭");

  let permission = isGroup ? "" : (current.permission || "");
  if (!isGroup && input?.permission !== undefined) permission = String(input.permission || "");
  if (permission && !PERMISSION_KEYS.includes(permission)) fail("權限不正確");

  let icon = current.icon || (isGroup ? "folder" : "link");
  if (!isGroup && input?.icon && MENU_ICONS.includes(input.icon)) icon = input.icon;
  if (isGroup) icon = "folder";

  const enabled = input?.enabled != null ? Boolean(input.enabled) : Number(current.enabled) === 1;
  const now = new Date().toISOString();
  await db
    .prepare(`UPDATE admin_menus SET
      parent_id = ?, label = ?, href = ?, icon = ?, permission = ?, enabled = ?, updated_at = ?
      WHERE id = ?`)
    .bind(parentId || null, label, href, icon, permission, enabled ? 1 : 0, now, id)
    .run();

  const items = await listMenus(db);
  return items.find((item) => item.id === id) || null;
}

export async function deleteMenu(db, id) {
  const current = await db.prepare("SELECT * FROM admin_menus WHERE id = ?").bind(id).first();
  if (!current) return false;
  if (Number(current.is_system) === 1) fail("系統選單不可刪除，可改為隱藏");
  const children = await db.prepare("SELECT COUNT(*) AS total FROM admin_menus WHERE parent_id = ?").bind(id).first();
  if (Number(children?.total || 0) > 0) fail("請先刪除或移走子選單");
  await db.prepare("DELETE FROM admin_menus WHERE id = ?").bind(id).run();
  return true;
}

export async function reorderMenus(db, parentId, ids) {
  if (!Array.isArray(ids) || ids.length === 0) fail("排序資料不正確");
  const parent = parentId ? String(parentId) : "";
  const rows = await db
    .prepare("SELECT id FROM admin_menus WHERE COALESCE(parent_id, '') = ?")
    .bind(parent)
    .all();
  const current = (rows.results || []).map((row) => row.id);
  const unique = new Set(ids);
  if (unique.size !== ids.length || current.length !== ids.length || ids.some((id) => !current.includes(id))) {
    fail("排序資料不正確");
  }
  const now = new Date().toISOString();
  await db.batch(
    ids.map((id, index) =>
      db.prepare("UPDATE admin_menus SET sort_order = ?, updated_at = ? WHERE id = ?").bind((index + 1) * 10, now, id)
    )
  );
}

export function isInvalid(error) {
  return error?.code === "INVALID";
}

export function isUnique(error) {
  return String(error?.message || "").includes("UNIQUE");
}
