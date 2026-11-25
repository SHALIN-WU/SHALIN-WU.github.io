import { STATUSES } from "./catalog.js";

const RECORD_FIELDS = [
  "first",
  "last",
  "company",
  "email",
  "phone",
  "country",
  "service",
  "cargo",
  "office",
  "origin",
  "destination",
  "pieces",
  "weight",
  "volume",
  "ready",
  "message",
  "locale",
  "reference",
  "serviceLabel",
  "officeName",
  "officeEmail"
];

export function inquiryAccess(permissions) {
  const list = Array.isArray(permissions) ? permissions : [];
  const canWrite = list.includes("inquiries.write");
  const hasProgress = list.includes("inquiries.progress");
  const canDelete = list.includes("inquiries.delete");
  const ownOnly = list.includes("inquiries.own");
  const canProgress = hasProgress && !canWrite;
  const canEdit = canWrite || hasProgress;
  return {
    canRead: list.includes("inquiries.read") || canEdit || canDelete,
    ownOnly,
    canWrite,
    canProgress,
    canDelete,
    canEdit,
    canCreate: canEdit,
    canAssign: canWrite && !ownOnly,
    canEditFields: canWrite && (list.includes("users.write") || canDelete),
    allowedStatuses: canWrite ? [...STATUSES] : (hasProgress ? ["in_progress"] : []),
    createStatuses: canWrite ? [...STATUSES] : (hasProgress ? ["new", "in_progress"] : [])
  };
}

export function accessPayload(access) {
  return {
    canCreate: access.canCreate,
    canEdit: access.canEdit,
    canWrite: access.canWrite,
    canDelete: access.canDelete,
    canAssign: access.canAssign,
    canEditFields: access.canEditFields,
    ownOnly: access.ownOnly,
    allowedStatuses: access.allowedStatuses,
    createStatuses: access.createStatuses
  };
}

export function statusChangeError(access, current, next) {
  if (next == null || next === "" || next === current) return "";
  if (!STATUSES.includes(next)) return "狀態不正確";
  if (access.canWrite) return "";
  if (access.canProgress && next === "in_progress") return "";
  if (access.canProgress) return "客服只能把狀態改成處理中";
  return "沒有權限修改狀態";
}

export function hasRecordFields(body) {
  return RECORD_FIELDS.some((key) => body && body[key] != null);
}

export function canSeeInquiry(access, session, item) {
  if (!item) return false;
  if (!access.ownOnly) return true;
  return item.assigneeId === session?.id;
}
