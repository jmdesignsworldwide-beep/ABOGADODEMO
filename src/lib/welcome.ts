/* ─────────────────────────────────────────────────────────────────────────
   Nombre amistoso para el saludo de bienvenida.
   Usa la identidad REAL de la cuenta con sesión (admin o cliente) — nunca un
   nombre fijo ni genérico — presentada con elegancia y capitalizada.
   Ej.: "lic.perez" → "Lic. Pérez" (no), "Lic. Perez" (sí, sin inventar tildes);
        "cliente.demo" → "Cliente Demo"; "jmadmin" → "Jmadmin".
   ───────────────────────────────────────────────────────────────────────── */

import type { Perfil } from "@/lib/auth";

/** Títulos profesionales: se muestran con mayúscula inicial y punto. */
const HONORIFICOS: Record<string, string> = {
  lic: "Lic.",
  licda: "Licda.",
  lcdo: "Lcdo.",
  lcda: "Lcda.",
  dr: "Dr.",
  dra: "Dra.",
  ing: "Ing.",
  arq: "Arq.",
  mtro: "Mtro.",
  mtra: "Mtra.",
};

/** Nombre con el que saludamos en la bienvenida (cuenta logueada). */
export function welcomeName(perfil: Pick<Perfil, "username">): string {
  return prettify(perfil.username);
}

/** Convierte el usuario en un nombre presentable (capitalizado, con título). */
function prettify(username: string): string {
  const tokens = username
    .split("@")[0]
    .split(/[._\-\s]+/)
    .filter(Boolean);
  if (tokens.length === 0) return "Bienvenido";
  return tokens
    .map((t) => {
      const low = t.toLowerCase();
      if (HONORIFICOS[low]) return HONORIFICOS[low];
      return low.charAt(0).toUpperCase() + low.slice(1);
    })
    .join(" ");
}
