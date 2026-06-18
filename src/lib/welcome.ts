/* ─────────────────────────────────────────────────────────────────────────
   Nombre amistoso para el saludo de bienvenida.
   Centralizado aquí para ajustarlo fácil. Usa la identidad REAL del usuario
   con sesión (no un genérico). Para el admin mostramos el nombre del abogado
   del bufete; para un cliente, su usuario presentado con elegancia.
   ───────────────────────────────────────────────────────────────────────── */

import type { Perfil } from "@/lib/auth";

/** Nombre con el que saludamos en la bienvenida. */
export function welcomeName(perfil: Pick<Perfil, "username" | "rol">): string {
  if (perfil.rol === "admin") return "Lic. Martínez";
  return prettify(perfil.username);
}

/** Convierte "cliente.demo" → "Cliente Demo" (sin email ni tecnicismos). */
function prettify(username: string): string {
  const base = username.split("@")[0].replace(/[._-]+/g, " ").trim();
  const pretty = base
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return pretty || "Bienvenido";
}
