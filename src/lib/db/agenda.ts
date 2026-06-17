import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Audiencia, AudienciaConCaso, Caso, Cliente } from "./types";

/* Lecturas de Agenda — solo servidor (service_role). */

type Row = Audiencia & {
  casos:
    | (Pick<Caso, "id" | "titulo" | "tipo" | "estado"> & {
        clientes: Pick<Cliente, "id" | "nombre"> | null;
      })
    | null;
};

function shape(row: Row): AudienciaConCaso {
  const { casos, ...a } = row;
  return {
    ...a,
    caso: casos
      ? { id: casos.id, titulo: casos.titulo, tipo: casos.tipo, estado: casos.estado, cliente: casos.clientes ?? null }
      : null,
  };
}

const SELECT = "*, casos(id, titulo, tipo, estado, clientes(id, nombre))";

export async function getAgenda(): Promise<AudienciaConCaso[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audiencias_citas")
    .select(SELECT)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true, nullsFirst: true });
  if (error) throw new Error(error.message);
  return (data as Row[] | null ?? []).map(shape);
}

export async function getAudienciaById(id: string): Promise<AudienciaConCaso | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("audiencias_citas").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return shape(data as Row);
}

/** Audiencias/citas de un caso (para el detalle del caso). */
export async function getAgendaByCaso(casoId: string): Promise<Audiencia[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audiencias_citas")
    .select("*")
    .eq("caso_id", casoId)
    .order("fecha", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Audiencia[] | null) ?? [];
}
