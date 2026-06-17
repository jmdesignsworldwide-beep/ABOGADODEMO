/* ─────────────────────────────────────────────────────────────────────────
   Datos de muestra del Dashboard (luego vendrán de Supabase).
   Realistas para República Dominicana: tribunales y casos creíbles.
   El "tiempo restante" se modela con `hours` (deterministico, SSR-safe).
   ───────────────────────────────────────────────────────────────────────── */

export type Gravity = "critico" | "proximo" | "aldia";

export type UrgentItem = {
  id: string;
  type: "audiencia" | "plazo";
  /** Caso al que pertenece. */
  caso: string;
  /** Acción concreta (qué hay que hacer / qué ocurre). */
  detalle: string;
  /** Tribunal o entidad. */
  tribunal: string;
  /** Horas restantes hasta el vencimiento. */
  hours: number;
  /** Expediente / referencia. */
  expediente: string;
};

export const urgentItems: UrgentItem[] = [
  {
    id: "aud-1",
    type: "audiencia",
    caso: "Sánchez vs. Inmobiliaria del Este",
    detalle: "Audiencia de fondo — producción de pruebas",
    tribunal: "Juzgado de Primera Instancia, Sala Civil, D.N.",
    hours: 18,
    expediente: "Exp. 034-2026-CIV-00412",
  },
  {
    id: "plz-1",
    type: "plazo",
    caso: "Martínez Hernández — Divorcio",
    detalle: "Vence notificación del acto introductivo",
    tribunal: "Juzgado de Primera Instancia, Cámara Civil, S.D. Este",
    hours: 30,
    expediente: "Exp. 549-2026-FAM-01187",
  },
  {
    id: "aud-2",
    type: "audiencia",
    caso: "Pérez vs. Seguros Universal",
    detalle: "Audiencia de conciliación laboral",
    tribunal: "Juzgado de Trabajo, Santo Domingo Este",
    hours: 40,
    expediente: "Exp. 091-2026-LAB-00733",
  },
  {
    id: "plz-2",
    type: "plazo",
    caso: "Sucesión Familia Reyes",
    detalle: "Depósito de conclusiones escritas",
    tribunal: "Corte de Apelación del D.N., 1ª Sala",
    hours: 72,
    expediente: "Exp. 026-2026-SUC-00208",
  },
  {
    id: "plz-3",
    type: "plazo",
    caso: "Constitución Grupo Caribe S.R.L.",
    detalle: "Vence registro mercantil (Cámara de Comercio)",
    tribunal: "Cámara de Comercio y Producción de Santo Domingo",
    hours: 120,
    expediente: "Ref. RM-2026-58841",
  },
  {
    id: "aud-3",
    type: "audiencia",
    caso: "Recurso de amparo — Cooperativa La Nacional",
    detalle: "Conocimiento del recurso de amparo",
    tribunal: "Corte de Apelación del D.N., Cámara Penal",
    hours: 200,
    expediente: "Exp. 472-2026-AMP-00094",
  },
];

/** Clasifica la gravedad según horas restantes. */
export function gravityFor(hours: number): Gravity {
  if (hours <= 48) return "critico";
  if (hours <= 168) return "proximo"; // dentro de la semana
  return "aldia";
}

/** Texto de cuenta regresiva: "en 18h", "en 2 días". */
export function countdownLabel(hours: number): string {
  if (hours <= 0) return "vencido";
  if (hours < 24) return `en ${hours}h`;
  const days = Math.round(hours / 24);
  return `en ${days} ${days === 1 ? "día" : "días"}`;
}

/** Resumen para la franja de alerta (derivado de los datos, siempre veraz). */
export function alertSummary(items: UrgentItem[] = urgentItems) {
  const plazosSemana = items.filter(
    (i) => i.type === "plazo" && i.hours <= 168,
  ).length;
  const audiencias48 = items.filter(
    (i) => i.type === "audiencia" && i.hours <= 48,
  ).length;
  return { plazosSemana, audiencias48 };
}

/* KPIs (segunda fila) */
export type Kpi = {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  trend: number;
  detalle: string;
};

export const kpis: Kpi[] = [
  { id: "casos", label: "Casos activos", value: 42, trend: 8, detalle: "Casos abiertos con actuaciones en curso." },
  { id: "clientes", label: "Clientes", value: 186, trend: 5, detalle: "Clientes activos del bufete." },
  { id: "audiencias", label: "Audiencias del mes", value: 17, trend: -3, detalle: "Audiencias agendadas en junio 2026." },
  { id: "facturado", label: "Facturado (RD$)", value: 2480000, prefix: "RD$ ", trend: 12, detalle: "Honorarios facturados en el mes." },
];

/* Avance de casos prioritarios (barras) */
export type PriorityCase = {
  id: string;
  caso: string;
  etapa: string;
  progreso: number;
};

export const priorityCases: PriorityCase[] = [
  { id: "pc-1", caso: "Sánchez vs. Inmobiliaria del Este", etapa: "Producción de pruebas", progreso: 82 },
  { id: "pc-2", caso: "Sucesión Familia Reyes", etapa: "Conclusiones", progreso: 64 },
  { id: "pc-3", caso: "Recurso de amparo — Cooperativa La Nacional", etapa: "Conocimiento", progreso: 45 },
  { id: "pc-4", caso: "Constitución Grupo Caribe S.R.L.", etapa: "Registro mercantil", progreso: 28 },
];
