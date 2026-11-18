import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "inquiries.json");

const STATUSES = ["new", "in_progress", "quoted", "closed", "spam"];

let cache = null;
let writeQueue = Promise.resolve();

function emptyDb() {
  return { version: 1, inquiries: [] };
}

async function ensureLoaded() {
  if (cache) return cache;
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    cache = {
      version: 1,
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : []
    };
  } catch (error) {
    if (error && error.code !== "ENOENT") throw error;
    cache = emptyDb();
    await persist();
  }
  return cache;
}

async function persist() {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_PATH}.${process.pid}.tmp`;
  const payload = JSON.stringify(cache, null, 2);
  await writeFile(tmp, payload, "utf8");
  await rename(tmp, DB_PATH);
}

function enqueueWrite() {
  writeQueue = writeQueue.then(persist, persist);
  return writeQueue;
}

function normalizeText(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

export function listStatuses() {
  return STATUSES.slice();
}

export async function listInquiries({ status, q, office, limit = 100, offset = 0 } = {}) {
  const db = await ensureLoaded();
  const needle = normalizeText(q, 80).toLowerCase();
  let rows = db.inquiries.slice();

  if (status && STATUSES.includes(status)) {
    rows = rows.filter((row) => row.status === status);
  }
  if (office) {
    const officeId = normalizeText(office, 32).toLowerCase();
    rows = rows.filter((row) => String(row.office || "").toLowerCase() === officeId);
  }
  if (needle) {
    rows = rows.filter((row) => {
      const hay = [
        row.reference,
        row.first,
        row.last,
        row.company,
        row.email,
        row.phone,
        row.country,
        row.service,
        row.cargo,
        row.origin,
        row.destination,
        row.message,
        row.officeName,
        row.notes
      ].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }

  rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const total = rows.length;
  const items = rows.slice(Number(offset) || 0, (Number(offset) || 0) + Math.min(Number(limit) || 100, 200));
  const counts = STATUSES.reduce((acc, key) => {
    acc[key] = db.inquiries.filter((row) => row.status === key).length;
    return acc;
  }, {});
  counts.all = db.inquiries.length;
  return { total, counts, items };
}

export async function getInquiry(id) {
  const db = await ensureLoaded();
  return db.inquiries.find((row) => row.id === id) || null;
}

const EDITABLE_FIELDS = [
  "reference",
  "status",
  "locale",
  "first",
  "last",
  "company",
  "email",
  "phone",
  "country",
  "service",
  "serviceLabel",
  "cargo",
  "office",
  "officeName",
  "officeEmail",
  "origin",
  "destination",
  "pieces",
  "weight",
  "volume",
  "ready",
  "message",
  "notes"
];

function applyFields(target, input) {
  for (const key of EDITABLE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) continue;
    if (key === "status") {
      if (!STATUSES.includes(input.status)) {
        const error = new Error("Invalid status");
        error.code = "INVALID_STATUS";
        throw error;
      }
      target.status = input.status;
      continue;
    }
    if (key === "email" || key === "officeEmail") {
      target[key] = normalizeText(input[key], 160).toLowerCase();
      continue;
    }
    if (key === "office") {
      target.office = normalizeText(input.office, 32).toLowerCase();
      continue;
    }
    if (key === "message" || key === "notes") {
      target[key] = normalizeText(input[key], 4000);
      continue;
    }
    if (key === "company") {
      target.company = normalizeText(input.company, 160);
      continue;
    }
    if (key === "reference") {
      target.reference = normalizeText(input.reference, 40) || target.reference;
      continue;
    }
    const max = key === "officeName" || key === "origin" || key === "destination" ? 160
      : key === "serviceLabel" ? 80
      : key === "locale" ? 16
      : 80;
    target[key] = normalizeText(input[key], max);
  }
  return target;
}

export async function createInquiry(input, meta = {}) {
  const db = await ensureLoaded();
  const now = new Date().toISOString();
  const record = applyFields({
    id: randomUUID(),
    reference: `NG-${Date.now()}`,
    status: "new",
    locale: "en",
    first: "",
    last: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    service: "",
    serviceLabel: "",
    cargo: "",
    office: "",
    officeName: "",
    officeEmail: "",
    origin: "",
    destination: "",
    pieces: "",
    weight: "",
    volume: "",
    ready: "",
    message: "",
    notes: "",
    createdAt: now,
    updatedAt: now,
    meta: {
      userAgent: normalizeText(meta.userAgent, 300),
      ip: normalizeText(meta.ip, 80)
    }
  }, input);

  if (!record.reference) record.reference = `NG-${Date.now()}`;
  if (!STATUSES.includes(record.status)) record.status = "new";

  db.inquiries.unshift(record);
  await enqueueWrite();
  return record;
}

export async function updateInquiry(id, patch = {}) {
  const db = await ensureLoaded();
  const index = db.inquiries.findIndex((row) => row.id === id);
  if (index < 0) return null;

  const current = db.inquiries[index];
  const next = applyFields({ ...current, updatedAt: new Date().toISOString() }, patch);
  db.inquiries[index] = next;
  await enqueueWrite();
  return next;
}

export async function deleteInquiry(id) {
  const db = await ensureLoaded();
  const index = db.inquiries.findIndex((row) => row.id === id);
  if (index < 0) return false;
  db.inquiries.splice(index, 1);
  await enqueueWrite();
  return true;
}
