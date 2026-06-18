import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Caso, Cliente, ClienteConConteo, Expediente } from "./types";

/* Lecturas de Clientes — solo servidor (usan la service_role). */

export async function getClientes(): Promise<ClienteConConteo[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("*, casos(count)")
    .order("nombre", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const { casos, ...cliente } = row as Cliente & {
      casos: { count: number }[];
    };
    return { ...cliente, casosCount: casos?.[0]?.count ?? 0 };
  });
}

/** Lista mínima (id + nombre) para selects de formularios. */
export async function getClientesMin(): Promise<Pick<Cliente, "id" | "nombre">[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nombre")
    .order("nombre", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type ClienteFicha = Cliente & {
  casos: (Caso & { expediente: Pick<Expediente, "id" | "numero"> | null })[];
};

export async function getClienteById(id: string): Promise<ClienteFicha | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("*, casos(*, expedientes(id, numero))")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { casos, ...cliente } = data as Cliente & {
    // expedientes llega como objeto (relación uno-a-uno), no como array.
    casos: (Caso & { expedientes: Pick<Expediente, "id" | "numero"> | null })[];
  };

  return {
    ...cliente,
    casos: (casos ?? [])
      .map(({ expedientes, ...caso }) => ({
        ...caso,
        expediente: expedientes ?? null,
      }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  };
}
