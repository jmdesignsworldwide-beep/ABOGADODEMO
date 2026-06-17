/* ─────────────────────────────────────────────────────────────────────────
   Mapa usuario ↔ email fantasma para Supabase Auth.
   El cliente solo ve "usuario + contraseña"; internamente se usa un email
   técnico (usuario@jmdesign.local) que nunca se muestra ni se pide.
   ───────────────────────────────────────────────────────────────────────── */

export const EMAIL_DOMAIN = "jmdesign.local";

/** Normaliza el usuario (minúsculas, sin espacios). */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/** Construye el email fantasma a partir del usuario. */
export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${EMAIL_DOMAIN}`;
}

/** Valida el formato del usuario: 3-30 chars, letras/números/._- */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9._-]{3,30}$/.test(username.trim());
}
