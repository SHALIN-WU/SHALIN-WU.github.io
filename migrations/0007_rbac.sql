CREATE TABLE IF NOT EXISTS admin_roles (
  id TEXT PRIMARY KEY NOT NULL,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_id TEXT NOT NULL,
  permission TEXT NOT NULL,
  PRIMARY KEY (role_id, permission)
);

CREATE TABLE IF NOT EXISTS admin_menus (
  id TEXT PRIMARY KEY NOT NULL,
  parent_id TEXT,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  href TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'link',
  permission TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  is_group INTEGER NOT NULL DEFAULT 0,
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_menus_parent ON admin_menus (parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_admin_role_permissions_role ON admin_role_permissions (role_id);

INSERT OR IGNORE INTO admin_roles (id, key, name, description, is_system, created_at, updated_at) VALUES
  ('role-admin', 'admin', '管理者', '可使用全部後台功能。', 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z'),
  ('role-editor', 'editor', '編輯者', '可處理客戶詢問，並檢視網站內容、媒體與動態頁面。', 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z');

INSERT OR IGNORE INTO admin_role_permissions (role_id, permission) VALUES
  ('role-admin', 'inquiries.read'),
  ('role-admin', 'inquiries.write'),
  ('role-admin', 'content.read'),
  ('role-admin', 'content.write'),
  ('role-admin', 'media.read'),
  ('role-admin', 'media.write'),
  ('role-admin', 'pages.read'),
  ('role-admin', 'pages.write'),
  ('role-admin', 'users.read'),
  ('role-admin', 'users.write'),
  ('role-admin', 'menus.read'),
  ('role-admin', 'menus.write'),
  ('role-admin', 'roles.read'),
  ('role-admin', 'roles.write'),
  ('role-editor', 'inquiries.read'),
  ('role-editor', 'inquiries.write'),
  ('role-editor', 'content.read'),
  ('role-editor', 'media.read'),
  ('role-editor', 'pages.read');

INSERT OR IGNORE INTO admin_menus (
  id, parent_id, key, label, href, icon, permission, sort_order, enabled, is_group, is_system, created_at, updated_at
) VALUES
  ('menu-content', NULL, 'content-group', '內容管理', '', 'folder', '', 10, 1, 1, 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z'),
  ('menu-system', NULL, 'system-group', '系統設定', '', 'folder', '', 20, 1, 1, 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z'),
  ('menu-inquiries', 'menu-content', 'inquiries', '客戶詢問', '/admin/', 'inquiry', 'inquiries.read', 10, 1, 0, 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z'),
  ('menu-site-content', 'menu-content', 'content', '網站內容', '/admin/content.html', 'content', 'content.read', 20, 1, 0, 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z'),
  ('menu-media', 'menu-content', 'media', '媒體', '/admin/media.html', 'media', 'media.read', 30, 1, 0, 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z'),
  ('menu-pages', 'menu-content', 'pages', '動態頁面', '/admin/pages.html', 'pages', 'pages.read', 40, 1, 0, 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z'),
  ('menu-users', 'menu-system', 'users', '使用者', '/admin/users.html', 'users', 'users.read', 10, 1, 0, 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z'),
  ('menu-menus', 'menu-system', 'menus', '選單管理', '/admin/menus.html', 'menus', 'menus.read', 20, 1, 0, 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z'),
  ('menu-roles', 'menu-system', 'roles', '角色權限', '/admin/roles.html', 'roles', 'roles.read', 30, 1, 0, 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z');

UPDATE admin_users SET role = 'editor' WHERE role = 'staff';
