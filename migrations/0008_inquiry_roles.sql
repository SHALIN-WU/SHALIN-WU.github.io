-- Inquiry roles: 管理員 / 業務 / 客服.
-- assignee_id is added by the API on first use (ALTER is not idempotent here).

UPDATE inquiries SET status = 'replied' WHERE status IN ('quoted', 'closed');
UPDATE inquiries SET status = 'new' WHERE status = 'spam';

UPDATE admin_roles SET name = '管理員'
WHERE key = 'admin' AND name = '管理者';

UPDATE admin_roles SET description = '可查看與處理全部詢問、刪除詢問，並管理帳號與角色。'
WHERE key = 'admin' AND description IN ('可使用全部後台功能。', '可使用全部後台功能，權限不可縮減。');

UPDATE admin_roles SET description = '可查看全部詢問並改狀態與備註，可檢視網站內容、媒體與動態頁面。不能刪除詢問。'
WHERE key = 'editor' AND description = '可處理客戶詢問，並檢視網站內容、媒體與動態頁面。';

INSERT OR IGNORE INTO admin_roles (id, key, name, description, is_system, created_at, updated_at) VALUES
  ('role-sales', 'sales', '業務', '可查看全部詢問，並修改狀態與備註。不能刪除，也不能管理帳號與角色。', 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z'),
  ('role-support', 'support', '客服', '只能查看指派給自己的詢問，可填寫備註，狀態只能改成處理中。', 1, '2026-11-25T00:00:00.000Z', '2026-11-25T00:00:00.000Z');

INSERT OR IGNORE INTO admin_role_permissions (role_id, permission) VALUES
  ('role-admin', 'inquiries.delete'),
  ('role-sales', 'inquiries.read'),
  ('role-sales', 'inquiries.write'),
  ('role-support', 'inquiries.read'),
  ('role-support', 'inquiries.own'),
  ('role-support', 'inquiries.progress');
