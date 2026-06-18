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

export type FacturaResumen = {
  id: string;
  numero: string;
  total: number;
  estado: Factura["estado"];
  fecha: string;
};

/** Facturas de un cliente (para el resumen financiero de su ficha). */
export async function getFacturasByCliente(clienteId: string): Promise<FacturaResumen[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("facturas")
    .select("id, numero, total, estado, fecha")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as FacturaResumen[] | null) ?? []).map((f) => ({ ...f, total: Number(f.total) }));
}

