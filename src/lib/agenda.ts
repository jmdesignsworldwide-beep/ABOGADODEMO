import type { Audiencia } from "@/lib/db/types";

/* ─────────────────────────────────────────────────────────────────────────
   Utilidades de tiempo de la Agenda.
   Todas reciben `now` explícito (lo pasa el servidor como ISO) para que el
   render sea idéntico en SSR e hidratación (sin desajustes).
   Mismo lenguaje de gravedad que el dashboard.
   ───────────────────────────────────────────────────────────────────────── */

export type Gravity = "critico" | "proximo" | "aldia" | "pasada";
export type GroupKey = "hoy" | "manana" | "semana" | "proximas" | "pasadas";

/** Combina fecha (YYYY-MM-DD) + hora (HH:MM[:SS]) en un Date local. */
export function audienciaDate(a: Pick<Audiencia, "fecha" | "hora">): Date {
  const [y, m, d] = a.fecha.split("-").map(Number);
  const [hh, mm] = (a.hora ?? "00:00").split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Días de calendario entre `now` y `target` (negativo = pasado). */
export function dayDiff(target: Date, now: Date): number {
  const a = startOfDay(now).getTime();
  const b = startOfDay(target).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function gravityFor(target: Date, now: Date): Gravity {
  const ms = target.getTime() - now.getTime();
  if (ms < 0) return "pasada";
  const hours = ms / 3_600_000;
  if (hours <= 48) return "critico";
  if (dayDiff(target, now) <= 7) return "proximo";
  return "aldia";
}

export function groupKeyFor(target: Date, now: Date): GroupKey {
  const dd = dayDiff(target, now);
  if (dd < 0) return "pasadas";
  if (dd === 0) return "hoy";
  if (dd === 1) return "manana";
  if (dd <= 7) return "semana";
  return "proximas";
}

export const GROUP_LABEL: Record<GroupKey, string> = {
  hoy: "Hoy",
  manana: "Mañana",
  semana: "Esta semana",
  proximas: "Próximas",
  pasadas: "Pasadas",
};

export const GROUP_ORDER: GroupKey[] = ["hoy", "manana", "semana", "proximas", "pasadas"];

/** Texto de cuenta regresiva corto y humano. */
export function countdownFor(target: Date, now: Date): string {
  const ms = target.getTime() - now.getTime();
  const dd = dayDiff(target, now);
  if (ms < 0) {
    if (dd === 0) return "Hoy (finalizada)";
    return `hace ${Math.abs(dd)} ${Math.abs(dd) === 1 ? "día" : "días"}`;
  }
  const hours = ms / 3_600_000;
  if (dd === 0) {
    if (hours < 1) return "en breve";
    return `en ${Math.round(hours)}h`;
  }
  if (dd === 1) return "Mañana";
  return `en ${dd} días`;
}

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatFechaCorta(a: Pick<Audiencia, "fecha" | "hora">): string {
  const d = audienciaDate(a);
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

export function formatFechaLarga(a: Pick<Audiencia, "fecha" | "hora">): string {
  const d = audienciaDate(a);
  const dia = DIAS[d.getDay()];
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${d.getDate()} de ${MESES[d.getMonth()]}, ${d.getFullYear()}`;
}

/** "9:30 AM" desde HH:MM:SS. */
export function formatHora(hora: string | null): string | null {
  if (!hora) return null;
  const [hh, mm] = hora.split(":").map(Number);
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}
