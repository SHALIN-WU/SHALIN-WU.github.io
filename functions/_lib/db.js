import { STATUSES } from "./catalog.js";

let inquiryReady = false;

export async function ensureInquirySchema(db) {
  if (inquiryReady) return;
  const cols = await db.prepare("PRAGMA table_info(inquiries)").all();
  const names = new Set((cols.results || []).map((col) => col.name));
  if (!names.has("assignee_id")) {
    try {
      await db.prepare("ALTER TABLE inquiries ADD COLUMN assignee_id TEXT NOT NULL DEFAULT ''").run();
    } catch (error) {
      if (!String(error?.message || "").toLowerCase().includes("duplicate")) throw error;
    }
  }
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_inquiries_assignee ON inquiries (assignee_id)").run();
  await db.prepare("UPDATE inquiries SET status = 'replied' WHERE status IN ('quoted', 'closed')").run();
  await db.prepare("UPDATE inquiries SET status = 'new' WHERE status = 'spam'").run();
  inquiryReady = true;
}

export async function resolveAssignee(db, assigneeId, currentId = "") {
  const id = String(assigneeId || "").trim();
  if (!id) return "";
  if (currentId && id === currentId) return id;
  const row = await db.prepare("SELECT id FROM admin_users WHERE id = ? AND active = 1").bind(id).first();
  if (!row) {
    const error = new Error("負責人不是有效的帳號");
    error.code = "INVALID_ASSIGNEE";
    throw error;
  }
  return row.id;
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    locale: row.locale,
    first: row.first_name,
    last: row.last_name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    country: row.country,
    service: row.service,
    serviceLabel: row.service_label,
    cargo: row.cargo,
    office: row.office,
    officeName: row.office_name,
    officeEmail: row.office_email,
    origin: row.origin,
    destination: row.destination,
    pieces: row.pieces,
    weight: row.weight,
    volume: row.volume,
    ready: row.ready,
    message: row.message,
    notes: row.notes,
    assigneeId: row.assignee_id || "",
    assigneeName: row.assignee_name || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    meta: {
      userAgent: row.user_agent || "",
      ip: row.ip || ""
    }
  };
}

export async function listInquiries(db, { status, q, office, assigneeId, limit = 100, offset = 0 } = {}) {
  await ensureInquirySchema(db);
  const where = [];
  const params = [];

  if (status && STATUSES.includes(status)) {
    where.push("i.status = ?");
    params.push(status);
  }
  if (office) {
    where.push("i.office = ?");
    params.push(String(office).toLowerCase());
  }
  if (assigneeId) {
    where.push("i.assignee_id = ?");
    params.push(String(assigneeId));
  }
  if (q && String(q).trim()) {
    const needle = `%${String(q).trim().toLowerCase()}%`;
    where.push(`(
      lower(i.reference) LIKE ? OR lower(i.first_name) LIKE ? OR lower(i.last_name) LIKE ? OR
      lower(i.company) LIKE ? OR lower(i.email) LIKE ? OR lower(i.phone) LIKE ? OR
      lower(i.country) LIKE ? OR lower(i.service) LIKE ? OR lower(i.cargo) LIKE ? OR
      lower(i.origin) LIKE ? OR lower(i.destination) LIKE ? OR lower(i.message) LIKE ? OR
      lower(i.office_name) LIKE ? OR lower(i.notes) LIKE ?
    )`);
    for (let i = 0; i < 14; i++) params.push(needle);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const safeLimit = Math.min(Number(limit) || 100, 200);
  const safeOffset = Number(offset) || 0;

  const list = await db
    .prepare(`SELECT i.*, u.display_name AS assignee_name
      FROM inquiries i
      LEFT JOIN admin_users u ON u.id = i.assignee_id
      ${whereSql}
      ORDER BY i.created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params, safeLimit, safeOffset)
    .all();

  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM inquiries i ${whereSql}`)
    .bind(...params)
    .first();

  const counts = { all: 0 };
  for (const key of STATUSES) counts[key] = 0;
  const countSql = assigneeId
    ? "SELECT status, COUNT(*) AS c FROM inquiries WHERE assignee_id = ? GROUP BY status"
    : "SELECT status, COUNT(*) AS c FROM inquiries GROUP BY status";
  const countRows = await db.prepare(countSql).bind(...(assigneeId ? [String(assigneeId)] : [])).all();
  for (const row of countRows.results || []) {
    counts[row.status] = row.c;
    counts.all += row.c;
  }

  return {
    total: totalRow?.total || 0,
    counts,
    items: (list.results || []).map(mapRow)
  };
}

export async function getInquiry(db, id) {
  await ensureInquirySchema(db);
  const row = await db
    .prepare(`SELECT i.*, u.display_name AS assignee_name
      FROM inquiries i
      LEFT JOIN admin_users u ON u.id = i.assignee_id
      WHERE i.id = ?`)
    .bind(id)
    .first();
  return mapRow(row);
}

export async function createInquiry(db, input, meta = {}) {
  await ensureInquirySchema(db);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const reference = input.reference || `NG-${Date.now()}`;
  const status = STATUSES.includes(input.status) ? input.status : "new";

  await db
    .prepare(`INSERT INTO inquiries (
      id, reference, status, locale, first_name, last_name, company, email, phone, country,
      service, service_label, cargo, office, office_name, office_email, origin, destination,
      pieces, weight, volume, ready, message, notes, assignee_id, created_at, updated_at, user_agent, ip
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      id,
      reference,
      status,
      input.locale || "en",
      input.first,
      input.last,
      input.company,
      String(input.email || "").toLowerCase(),
      input.phone,
      input.country,
      input.service,
      input.serviceLabel || "",
      input.cargo,
      String(input.office || "").toLowerCase(),
      input.officeName || "",
      String(input.officeEmail || "").toLowerCase(),
      input.origin,
      input.destination || "",
      input.pieces || "",
      input.weight || "",
      input.volume || "",
      input.ready,
      input.message || "",
      input.notes || "",
      input.assigneeId || "",
      now,
      now,
      meta.userAgent || "",
      meta.ip || ""
    )
    .run();

  return getInquiry(db, id);
}

export async function updateInquiry(db, id, patch = {}) {
  await ensureInquirySchema(db);
  const current = await getInquiry(db, id);
  if (!current) return null;

  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  };
  if (patch.status && !STATUSES.includes(patch.status)) {
    const error = new Error("Invalid status");
    error.code = "INVALID_STATUS";
    throw error;
  }

  await db
    .prepare(`UPDATE inquiries SET
      reference = ?, status = ?, locale = ?, first_name = ?, last_name = ?, company = ?,
      email = ?, phone = ?, country = ?, service = ?, service_label = ?, cargo = ?,
      office = ?, office_name = ?, office_email = ?, origin = ?, destination = ?,
      pieces = ?, weight = ?, volume = ?, ready = ?, message = ?, notes = ?, assignee_id = ?, updated_at = ?
      WHERE id = ?`)
    .bind(
      next.reference,
      next.status,
      next.locale,
      next.first,
      next.last,
      next.company,
      String(next.email || "").toLowerCase(),
      next.phone,
      next.country,
      next.service,
      next.serviceLabel || "",
      next.cargo,
      String(next.office || "").toLowerCase(),
      next.officeName || "",
      String(next.officeEmail || "").toLowerCase(),
      next.origin,
      next.destination || "",
      next.pieces || "",
      next.weight || "",
      next.volume || "",
      next.ready,
      next.message || "",
      next.notes || "",
      next.assigneeId || "",
      next.updatedAt,
      id
    )
    .run();

  return getInquiry(db, id);
}

export async function deleteInquiry(db, id) {
  await ensureInquirySchema(db);
  const result = await db.prepare("DELETE FROM inquiries WHERE id = ?").bind(id).run();
  return (result.meta?.changes || 0) > 0;
}
