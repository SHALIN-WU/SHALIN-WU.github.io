const MAX_BYTES = 180 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function parseDataUrl(dataUrl) {
  const raw = String(dataUrl || "").trim();
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i.exec(raw);
  if (!match) {
    const error = new Error("僅支援 JPEG / PNG / WebP 圖片");
    error.code = "INVALID_AVATAR";
    throw error;
  }
  const mime = match[1].toLowerCase();
  const base64 = match[2].replace(/\s+/g, "");
  if (!ALLOWED.has(mime)) {
    const error = new Error("不支援的圖片格式");
    error.code = "INVALID_AVATAR";
    throw error;
  }
  // rough size check: base64 length * 0.75
  const approx = Math.floor((base64.length * 3) / 4);
  if (approx > MAX_BYTES) {
    const error = new Error("圖片太大，請選擇較小的檔案");
    error.code = "AVATAR_TOO_LARGE";
    throw error;
  }
  return { mime, base64, approx };
}

export function decodeBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
