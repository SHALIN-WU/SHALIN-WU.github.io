-- Restore permissions that 管理員 needs to open 系統設定 and edit site content.
-- These rows were missing on role-admin, so the sidebar hid 使用者 / 選單管理 / 角色權限.

INSERT OR IGNORE INTO admin_role_permissions (role_id, permission) VALUES
  ('role-admin', 'content.write'),
  ('role-admin', 'media.write'),
  ('role-admin', 'pages.write'),
  ('role-admin', 'users.read'),
  ('role-admin', 'users.write'),
  ('role-admin', 'menus.read'),
  ('role-admin', 'menus.write'),
  ('role-admin', 'roles.read'),
  ('role-admin', 'roles.write');
