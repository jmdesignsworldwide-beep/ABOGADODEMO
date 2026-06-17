import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Caso, CasoConRelaciones, Cliente, Expediente } from "./types";

/* Lecturas de Casos — solo servidor (service_role). */

type Row = Caso & {
  // caso_id es único → PostgREST devuelve el expediente como objeto (no array).
  clientes: Pick<Cliente, "id" | "nombre" | "tipo"> | null;
  expedientes: Expediente | null;
};

function shape(row: Row): CasoConRelaciones {
  const { clientes, expedientes, ...caso } = row;
  return {
    ...caso,
    cliente: clientes ?? null,
    expediente: expedientes ?? null,
  };
}

const SELECT = "*, clientes(id, nombre, tipo), expedientes(*)";

export async function getCasos(): Promise<CasoConRelaciones[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("casos")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[] | null ?? []).map(shape);
}

export async function getCasoById(id: string): Promise<CasoConRelaciones | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("casos")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return shape(data as Row);
}
