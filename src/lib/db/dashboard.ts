import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAgenda } from "./agenda";
import type { AudienciaConCaso } from "./types";

const ESTADOS_ACTIVOS = ["abierto", "en_proceso", "suspendido"];

export type DashboardData = {
  kpis: {
    casosActivos: number;
    clientes: number;
    audienciasMes: number;
    facturadoMes: number;
  };
  urgentes: AudienciaConCaso[]; // audiencias/citas próximas (reales)
  prioritarios: { id: string; titulo: string; avance: number }[];
};

/** Datos reales del Panel, consistentes con cada módulo. */
export async function getDashboard(): Promise<DashboardData> {
  const admin = createAdminClient();
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const hoy = now.toISOString().slice(0, 10);

  const [casosActivos, clientes, audienciasMes, facturasMes, agenda, prioritarios] =
    await Promise.all([
      admin.from("casos").select("id", { count: "exact", head: true }).in("estado", ESTADOS_ACTIVOS),
      admin.from("clientes").select("id", { count: "exact", head: true }),
      admin
        .from("audiencias_citas")
        .select("id", { count: "exact", head: true })
        .gte("fecha", first)
        .lte("fecha", last),
      admin.from("facturas").select("total").gte("fecha", first).lte("fecha", last).neq("estado", "anulada"),
      getAgenda(),
      admin
        .from("casos")
        .select("id, titulo, avance")
        .in("estado", ESTADOS_ACTIVOS)
        .order("avance", { ascending: false })
        .limit(5),
    ]);

  const facturadoMes = (facturasMes.data ?? []).reduce((a, f) => a + Number(f.total), 0);
  const urgentes = agenda.filter((a) => a.fecha >= hoy); // próximas (incluye hoy)

  return {
    kpis: {
      casosActivos: casosActivos.count ?? 0,
      clientes: clientes.count ?? 0,
      audienciasMes: audienciasMes.count ?? 0,
      facturadoMes,
    },
    urgentes,
    prioritarios: ((prioritarios.data as { id: string; titulo: string; avance: number }[] | null) ?? []).map(
      (c) => ({ id: c.id, titulo: c.titulo, avance: c.avance }),
    ),
  };
}
