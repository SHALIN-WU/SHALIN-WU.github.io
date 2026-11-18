import { findOffice, findService, LOCALES, STATUSES } from "./catalog.js";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function requiredString(value, max) {
  const text = String(value ?? "").trim();
  if (!text || text.length > max) return null;
  return text;
}

function optionalString(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

export function parseInquiryPayload(body, { allowStatus = false } = {}) {
  const errors = [];
  const data = {};

  const first = requiredString(body?.first, 80);
  const last = requiredString(body?.last, 80);
  const company = requiredString(body?.company, 160);
  const email = requiredString(body?.email, 160);
  const phone = requiredString(body?.phone, 60);
  const country = requiredString(body?.country, 80);
  const service = requiredString(body?.service, 40);
  const cargo = requiredString(body?.cargo, 80);
  const officeId = requiredString(body?.office, 32);
  const origin = requiredString(body?.origin, 160);
  const ready = requiredString(body?.ready, 40);
  const destination = optionalString(body?.destination, 160);

  if (!first) errors.push("名字必填");
  if (!last) errors.push("姓氏必填");
  if (!company) errors.push("公司必填");
  if (!email) errors.push("Email 必填");
  else if (!isValidEmail(email)) errors.push("Email 格式不正確");
  if (!phone) errors.push("電話必填");
  if (!country) errors.push("國家必填");
  if (!service) errors.push("服務必填");
  if (!cargo) errors.push("貨型必填");
  if (!officeId) errors.push("辦公室必填");
  if (!origin) errors.push("起運地必填");
  if (!ready) errors.push("可出貨日必填");
  if (service && service !== "agency" && !destination) errors.push("目的地必填");

  const office = officeId ? findOffice(officeId.toLowerCase()) : null;
  if (officeId && !office) errors.push("未知的辦公室");

  const serviceMeta = service ? findService(service) : null;
  const locale = optionalString(body?.locale, 16) || "zh-tw";

  if (allowStatus && body?.status != null && body.status !== "") {
    if (!STATUSES.includes(body.status)) errors.push("狀態不正確");
    else data.status = body.status;
  }

  if (errors.length) return { ok: false, errors, data: null };

  data.first = first;
  data.last = last;
  data.company = company;
  data.email = email;
  data.phone = phone;
  data.country = country;
  data.service = service;
  data.serviceLabel = optionalString(body?.serviceLabel, 80) || (serviceMeta ? serviceMeta.label : service);
  data.cargo = cargo;
  data.office = office.id;
  data.officeName = optionalString(body?.officeName, 120) || office.name;
  data.officeEmail = optionalString(body?.officeEmail, 160) || office.email;
  data.origin = origin;
  data.destination = destination;
  data.pieces = optionalString(body?.pieces, 40);
  data.weight = optionalString(body?.weight, 40);
  data.volume = optionalString(body?.volume, 40);
  data.ready = ready;
  data.message = optionalString(body?.message, 4000);
  data.locale = locale;
  data.notes = optionalString(body?.notes, 4000);
  if (body?.reference) data.reference = optionalString(body.reference, 40);

  if (data.officeEmail && !isValidEmail(data.officeEmail)) {
    return { ok: false, errors: ["辦公室 Email 格式不正確"], data: null };
  }

  return { ok: true, errors: [], data };
}

export { LOCALES, STATUSES };
