import { STATUSES } from "./catalog.js";

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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    meta: {
      userAgent: row.user_agent || "",
      ip: row.ip || ""
    }
  };
}

export async function listInquiries(db, { status, q, office, limit = 100, offset = 0 } = {}) {
  const where = [];
  const params = [];

  if (status && STATUSES.includes(status)) {
    where.push("status = ?");
    params.push(status);
  }
  if (office) {
    where.push("office = ?");
    params.push(String(office).toLowerCase());
  }
  if (q && String(q).trim()) {
    const needle = `%${String(q).trim().toLowerCase()}%`;
    where.push(`(
      lower(reference) LIKE ? OR lower(first_name) LIKE ? OR lower(last_name) LIKE ? OR
      lower(company) LIKE ? OR lower(email) LIKE ? OR lower(phone) LIKE ? OR
      lower(country) LIKE ? OR lower(service) LIKE ? OR lower(cargo) LIKE ? OR
      lower(origin) LIKE ? OR lower(destination) LIKE ? OR lower(message) LIKE ? OR
      lower(office_name) LIKE ? OR lower(notes) LIKE ?
    )`);
    for (let i = 0; i < 14; i++) params.push(needle);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const safeLimit = Math.min(Number(limit) || 100, 200);
  const safeOffset = Number(offset) || 0;

  const list = await db
    .prepare(`SELECT * FROM inquiries ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params, safeLimit, safeOffset)
    .all();

  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM inquiries ${whereSql}`)
    .bind(...params)
    .first();

  const counts = { all: 0 };
  for (const key of STATUSES) counts[key] = 0;
  const countRows = await db.prepare("SELECT status, COUNT(*) AS c FROM inquiries GROUP BY status").all();
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
  const row = await db.prepare("SELECT * FROM inquiries WHERE id = ?").bind(id).first();
  return mapRow(row);
}

export async function createInquiry(db, input, meta = {}) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const reference = input.reference || `NG-${Date.now()}`;
  const status = STATUSES.includes(input.status) ? input.status : "new";

  await db
    .prepare(`INSERT INTO inquiries (
      id, reference, status, locale, first_name, last_name, company, email, phone, country,
      service, service_label, cargo, office, office_name, office_email, origin, destination,
      pieces, weight, volume, ready, message, notes, created_at, updated_at, user_agent, ip
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
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
      now,
      now,
      meta.userAgent || "",
      meta.ip || ""
    )
    .run();

  return getInquiry(db, id);
}

export async function updateInquiry(db, id, patch = {}) {
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
      pieces = ?, weight = ?, volume = ?, ready = ?, message = ?, notes = ?, updated_at = ?
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
      next.updatedAt,
      id
    )
    .run();

  return getInquiry(db, id);
}

export async function deleteInquiry(db, id) {
  const result = await db.prepare("DELETE FROM inquiries WHERE id = ?").bind(id).run();
  return (result.meta?.changes || 0) > 0;
}
