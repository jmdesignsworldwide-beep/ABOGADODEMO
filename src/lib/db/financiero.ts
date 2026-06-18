import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CategoriaEgreso, Egreso } from "./types";

export type FacturaLite = { id: string; numero: string; cliente: string; total: number; fecha: string };

export type Movimiento =
  | { tipo: "ingreso"; id: string; facturaId: string; etiqueta: string; ref: string; monto: number; fecha: string }
  | { tipo: "egreso"; id: string; egreso: Egreso };

export type FinancieroData = {
  mesActual: string; // YYYY-MM
  kpis: { ingresosMes: number; egresosMes: number; balanceMes: number; honorariosPendientes: number };
  serie: { mes: string; key: string; ingresos: number; egresos: number }[];
  porCategoria: { categoria: CategoriaEgreso; monto: number }[];
  honorarios: { cobrado: number; pendiente: number };
  movimientos: Movimiento[];
  // Datos crudos para los desgloses clickeables
  facturasPagadas: FacturaLite[];
  facturasPendientes: FacturaLite[];
  egresos: Egreso[];
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const monthKey = (iso: string) => iso.slice(0, 7);

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

  const toLite = (f: FRow): FacturaLite => ({ id: f.id, numero: f.numero, cliente: f.clientes?.nombre ?? f.numero, total: Number(f.total), fecha: f.fecha });
  const facturasPagadas = facturas.filter((f) => f.estado === "pagada").map(toLite);
  const facturasPendientes = facturas.filter((f) => f.estado === "pendiente").map(toLite);

  const sumTotal = (arr: FacturaLite[]) => arr.reduce((a, x) => a + x.total, 0);

  const ingresosMes = sumTotal(facturasPagadas.filter((f) => monthKey(f.fecha) === mesActual));
  const egresosMes = egresos.filter((e) => monthKey(e.fecha) === mesActual).reduce((a, e) => a + Number(e.monto), 0);
  const honorariosPendientes = sumTotal(facturasPendientes);
  const cobrado = sumTotal(facturasPagadas);

  const serie: FinancieroData["serie"] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    serie.push({
      mes: MESES[d.getMonth()],
      key,
      ingresos: facturasPagadas.filter((f) => monthKey(f.fecha) === key).reduce((a, f) => a + f.total, 0),
      egresos: egresos.filter((e) => monthKey(e.fecha) === key).reduce((a, e) => a + Number(e.monto), 0),
    });
  }

  const catMap = new Map<CategoriaEgreso, number>();
  for (const e of egresos) catMap.set(e.categoria, (catMap.get(e.categoria) ?? 0) + Number(e.monto));
  const porCategoria = [...catMap.entries()].map(([categoria, monto]) => ({ categoria, monto })).sort((a, b) => b.monto - a.monto);

  const movIngresos: Movimiento[] = facturasPagadas.map((f) => ({ tipo: "ingreso", id: `f-${f.id}`, facturaId: f.id, etiqueta: f.cliente, ref: f.numero, monto: f.total, fecha: f.fecha }));
  const movEgresos: Movimiento[] = egresos.map((e) => ({ tipo: "egreso", id: `e-${e.id}`, egreso: e }));
  const movimientos = [...movIngresos, ...movEgresos]
    .sort((a, b) => {
      const fa = a.tipo === "ingreso" ? a.fecha : a.egreso.fecha;
      const fb = b.tipo === "ingreso" ? b.fecha : b.egreso.fecha;
      return fb.localeCompare(fa);
    })
    .slice(0, 12);

  return {
    mesActual,
    kpis: { ingresosMes, egresosMes, balanceMes: ingresosMes - egresosMes, honorariosPendientes },
    serie,
    porCategoria,
    honorarios: { cobrado, pendiente: honorariosPendientes },
    movimientos,
    facturasPagadas,
    facturasPendientes,
    egresos,
  };
}
