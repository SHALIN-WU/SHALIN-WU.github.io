export const OFFICES = [
  { id: "tpe", name: "Taipei · Head office", email: "info.tpe@northgo.com" },
  { id: "txg", name: "Taichung", email: "info.txg@northgo.com" },
  { id: "khh", name: "Kaohsiung", email: "info.khh@northgo.com" },
  { id: "tyo", name: "Tokyo", email: "info.tyo@northgo.com" },
  { id: "osa", name: "Osaka", email: "info.osa@northgo.com" },
  { id: "hcmc", name: "Ho Chi Minh City", email: "info.hcmc@northgo.com" },
  { id: "lax", name: "Los Angeles", email: "info.lax@northgo.com" }
];

export const SERVICES = [
  { id: "ocean", label: "Ocean freight" },
  { id: "air", label: "Air freight" },
  { id: "land", label: "Land transport" },
  { id: "customs", label: "Customs clearance" },
  { id: "freight", label: "Freight logistics" },
  { id: "project", label: "Project logistics" },
  { id: "warehouse", label: "Warehouse logistics" },
  { id: "agency", label: "Shipping agency" },
  { id: "other", label: "Other" }
];

export const LOCALES = [
  { id: "en", label: "English" },
  { id: "zh-tw", label: "繁體中文" },
  { id: "ja", label: "日本語" },
  { id: "vi", label: "Tiếng Việt" }
];

export function findOffice(id) {
  return OFFICES.find((office) => office.id === id) || null;
}

export function findService(id) {
  return SERVICES.find((service) => service.id === id) || null;
}
