import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Caso, Cliente, Factura, FacturaConVinculos } from "./types";

type Row = Factura & {
  clientes: Pick<Cliente, "id" | "nombre" | "tipo" | "tipo_documento" | "documento"> | null;
  casos: Pick<Caso, "id" | "titulo"> | null;
};

function shape(row: Row): FacturaConVinculos {
  const { clientes, casos, ...f } = row;
  return { ...f, cliente: clientes ?? null, caso: casos ?? null };
}

const SELECT =
  "*, clientes(id, nombre, tipo, tipo_documento, documento), casos(id, titulo)";

export async function getFacturas(): Promise<FacturaConVinculos[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("facturas")
    .select(SELECT)
    .order("fecha", { ascending: false })
    .order("numero", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[] | null ?? []).map(shape);
}

export async function getFacturaById(id: string): Promise<FacturaConVinculos | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("facturas").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return shape(data as Row);
}
