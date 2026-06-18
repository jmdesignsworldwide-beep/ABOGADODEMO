import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Caso, Cliente, Expediente, ExpedienteConCaso } from "./types";

/* Lecturas de Expedientes — solo servidor (service_role). */

type Row = Expediente & {
  casos:
    | (Pick<Caso, "id" | "titulo" | "tipo" | "estado"> & {
        clientes: Pick<Cliente, "id" | "nombre"> | null;
      })
    | null;
};

function shape(row: Row): ExpedienteConCaso {
  const { casos, ...expediente } = row;
  return {
    ...expediente,
    caso: casos
      ? {
          id: casos.id,
          titulo: casos.titulo,
          tipo: casos.tipo,
          estado: casos.estado,
          cliente: casos.clientes ?? null,
        }
      : null,
  };
}

const SELECT = "*, casos(id, titulo, tipo, estado, clientes(id, nombre))";

export async function getExpedientes(): Promise<ExpedienteConCaso[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("expedientes")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[] | null ?? []).map(shape);
}

export async function getExpedienteById(id: string): Promise<ExpedienteConCaso | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("expedientes").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return shape(data as Row);
}

/** Casos que aún no tienen expediente (para el select del formulario). */
export async function getCasosSinExpediente(
  incluirCasoId?: string,
): Promise<Pick<Caso, "id" | "titulo">[]> {
  const supabase = createAdminClient();
  const { data: exps, error: e1 } = await supabase.from("expedientes").select("caso_id");
  if (e1) throw new Error(e1.message);
  const ocupados = new Set((exps ?? []).map((e) => e.caso_id as string));
  if (incluirCasoId) ocupados.delete(incluirCasoId);

  const { data, error } = await supabase
    .from("casos")
    .select("id, titulo")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).filter((c) => !ocupados.has(c.id));
}
