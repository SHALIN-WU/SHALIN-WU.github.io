export const LOCALES = ["en", "zh-tw", "ja", "vi"];

export function L(en, zh, ja, vi) {
  return { en, "zh-tw": zh, ja, vi };
}
