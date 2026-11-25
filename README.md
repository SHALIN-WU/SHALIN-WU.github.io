# Northgo website

Static Northgo marketing site plus an enquiry admin backend.

## Architecture

| Layer | Role |
|------|------|
| `site/` | Generated static frontend (EN / 繁中 / JA / VI) |
| `admin/` | Enquiry admin UI (login + CRUD) |
| `functions/` | Cloudflare Pages Functions API |
| Cloudflare **D1** | Enquiry database (`northgo-inquiries`) |
| `server/` | Optional local Node fallback (JSON file; not used in Cloudflare prod) |

## Generate pages

```powershell
node build/generate.mjs
```

## GitHub

Remote: `https://github.com/SHALIN-WU/SHALIN-WU.github.io.git`

## Cloudflare Pages + D1

### 1. Install tooling

```powershell
npm install
```

### 2. Create D1 database

```powershell
npx wrangler login
npx wrangler d1 create northgo-inquiries
```

Copy the returned `database_id` into `wrangler.toml`.

### 3. Apply schema

```powershell
npm run db:remote
```

### 4. Prepare static output and deploy

```powershell
npm run deploy
```

### 5. Set secrets (production)

```powershell
npx wrangler pages secret put SESSION_SECRET --project-name=northgo
npx wrangler pages secret put ADMIN_PASSWORD --project-name=northgo
```

Default admin username is `admin` (`ADMIN_USERNAME` in `wrangler.toml`).

### Local Cloudflare emulation

```powershell
npm run db:local
npm run dev:cf
```

## Local Node fallback (optional)

```powershell
npm start
```

Serves `site/` + `admin/` with a JSON file store under `data/` (not D1).

## Admin

- Login: `/admin/login.html`
- Manage enquiries: `/admin/`
- Manage users (admin role): `/admin/users.html`

Roles for Northgo enquiries:

- `admin` — 管理員. Sees every enquiry, can change status and notes, can delete, and can manage accounts and roles.
- `sales` — 業務. Sees every enquiry and can change status and notes. Cannot delete, and cannot manage accounts or roles.
- `support` — 客服. Sees only enquiries assigned to them. Can edit notes, and can only change status to 處理中. Cannot delete, and cannot manage accounts or roles.
- `editor` — 編輯者. Legacy role: same enquiry updates as 業務, plus read-only site content, media, and pages. Cannot delete enquiries.

Statuses are 新進 (`new`), 處理中 (`in_progress`), and 已回覆 (`replied`). Older values `quoted` and `closed` become 已回覆; `spam` becomes 新進. Assign a 客服 on the enquiry so that account can see it.

Custom roles can be created under 角色權限. A write permission always includes its matching read permission. 「只看指派給自己的詢問」limits the list to that user. 「只能把狀態改成處理中」cannot set 已回覆.

The sidebar comes from 選單管理. A menu item is visible when it is enabled and the signed-in role has its required permission. Existing `staff` accounts are migrated to `editor`.

The API seeds 業務 and 客服 the first time a signed-in request runs. `migrations/0008_inquiry_roles.sql` writes the same rows if you apply it yourself. The assignee column is added automatically.

Apply the RBAC tables before using the new pages:

```powershell
npm run db:rbac:local
```

Remote:

```powershell
npm run db:rbac
```

First login with the env bootstrap credentials (`ADMIN_USERNAME` / `ADMIN_PASSWORD`) seeds the first admin user into D1 when the users table is empty.
