/* ─────────────────────────────────────────────────────────────────────────
   Helpers de documentos (puros, cliente + servidor).
   ───────────────────────────────────────────────────────────────────────── */

export const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB

export const ALLOWED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ACCEPT_ATTR = ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx";

export type FileCategory = "pdf" | "image" | "word" | "otro";

export function categoryFromMime(mime: string | null): FileCategory {
  if (!mime) return "otro";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.includes("word") || mime === "application/msword") return "word";
  return "otro";
}

export function isImage(mime: string | null): boolean {
  return categoryFromMime(mime) === "image";
}

/** Valida tipo y tamaño. Devuelve un mensaje de error o null si es válido. */
export function validateFile(file: { type: string; size: number; name: string }): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const okExt = ["pdf", "png", "jpg", "jpeg", "webp", "doc", "docx"].includes(ext);
  if (!ALLOWED_MIME.includes(file.type) && !okExt) {
    return "Tipo de archivo no permitido. Usa PDF, imagen o Word.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return `El archivo supera el máximo de 15 MB (${formatBytes(file.size)}).`;
  }
  if (file.size === 0) return "El archivo está vacío.";
  return null;
}

export function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
