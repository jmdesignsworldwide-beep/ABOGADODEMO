import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CategoriaEgreso, Egreso } from "./types";

export type Movimiento =
  | { tipo: "ingreso"; id: string; facturaId: string; etiqueta: string; ref: string; monto: number; fecha: string }
  | { tipo: "egreso"; id: string; egreso: Egreso };

export type FinancieroData = {
  kpis: { ingresosMes: number; egresosMes: number; balanceMes: number; honorariosPendientes: number };
  serie: { mes: string; ingresos: number; egresos: number }[];
  porCategoria: { categoria: CategoriaEgreso; monto: number }[];
  honorarios: { cobrado: number; pendiente: number };
  movimientos: Movimiento[];
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const monthKey = (iso: string) => iso.slice(0, 7); // YYYY-MM

export async function getFinanciero(): Promise<FinancieroData> {
  const admin = createAdminClient();
  const now = new Date();
  const mesActual = now.toISOString().slice(0, 7);

  const [facturasRes, egresosRes] = await Promise.all([
    admin.from("facturas").select("id, numero, total, estado, fecha, clientes(nombre)"),
    admin.from("egresos").select("*").order("fecha", { ascending: false }),
  ]);
  if (facturasRes.error) throw new Error(facturasRes.error.message);
  if (egresosRes.error) throw new Error(egresosRes.error.message);

  type FRow = { id: string; numero: string; total: number; estado: string; fecha: string; clientes: { nombre: string } | null };
  const facturas = (facturasRes.data as unknown as FRow[] | null) ?? [];
  const egresos = (egresosRes.data as Egreso[] | null) ?? [];

  const pagadas = facturas.filter((f) => f.estado === "pagada");
  const pendientes = facturas.filter((f) => f.estado === "pendiente");

  const sum = (arr: { total?: number; monto?: number }[], key: "total" | "monto") =>
    arr.reduce((a, x) => a + Number(x[key] ?? 0), 0);

  const ingresosMes = sum(pagadas.filter((f) => monthKey(f.fecha) === mesActual), "total");
  const egresosMes = egresos.filter((e) => monthKey(e.fecha) === mesActual).reduce((a, e) => a + Number(e.monto), 0);
  const honorariosPendientes = sum(pendientes, "total");
  const cobrado = sum(pagadas, "total");

  // Serie de los últimos 6 meses
  const serie: { mes: string; ingresos: number; egresos: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    serie.push({
      mes: MESES[d.getMonth()],
      ingresos: pagadas.filter((f) => monthKey(f.fecha) === key).reduce((a, f) => a + Number(f.total), 0),
      egresos: egresos.filter((e) => monthKey(e.fecha) === key).reduce((a, e) => a + Number(e.monto), 0),
    });
  }

  // Egresos por categoría
  const catMap = new Map<CategoriaEgreso, number>();
  for (const e of egresos) catMap.set(e.categoria, (catMap.get(e.categoria) ?? 0) + Number(e.monto));
  const porCategoria = [...catMap.entries()]
    .map(([categoria, monto]) => ({ categoria, monto }))
    .sort((a, b) => b.monto - a.monto);

  // Movimientos recientes (ingresos pagados + egresos)
  const movIngresos: Movimiento[] = pagadas.map((f) => ({
    tipo: "ingreso",
    id: `f-${f.id}`,
    facturaId: f.id,
    etiqueta: f.clientes?.nombre ?? f.numero,
    ref: f.numero,
    monto: Number(f.total),
    fecha: f.fecha,
  }));
  const movEgresos: Movimiento[] = egresos.map((e) => ({ tipo: "egreso", id: `e-${e.id}`, egreso: e }));
  const movimientos = [...movIngresos, ...movEgresos]
    .sort((a, b) => {
      const fa = a.tipo === "ingreso" ? a.fecha : a.egreso.fecha;
      const fb = b.tipo === "ingreso" ? b.fecha : b.egreso.fecha;
      return fb.localeCompare(fa);
    })
    .slice(0, 12);

  return {
    kpis: { ingresosMes, egresosMes, balanceMes: ingresosMes - egresosMes, honorariosPendientes },
    serie,
    porCategoria,
    honorarios: { cobrado, pendiente: honorariosPendientes },
    movimientos,
  };
}
