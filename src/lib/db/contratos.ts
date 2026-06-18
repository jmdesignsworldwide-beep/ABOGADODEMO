import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Caso, Cliente, ContratoConVinculos, DocumentoGenerado } from "./types";

type Row = DocumentoGenerado & {
  clientes: Pick<Cliente, "id" | "nombre"> | null;
  casos: Pick<Caso, "id" | "titulo"> | null;
};

function shape(r: Row): ContratoConVinculos {
  const { clientes, casos, ...d } = r;
  return { ...d, cliente: clientes ?? null, caso: casos ?? null };
}

const SELECT = "*, clientes(id, nombre), casos(id, titulo)";

export async function getContratos(): Promise<ContratoConVinculos[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("documentos_generados").select(SELECT).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[] | null ?? []).map(shape);
}

export async function getContratoById(id: string): Promise<ContratoConVinculos | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("documentos_generados").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return shape(data as Row);
}

export async function getContratosByCliente(clienteId: string): Promise<ContratoConVinculos[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("documentos_generados").select(SELECT).eq("cliente_id", clienteId).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[] | null ?? []).map(shape);
}

export async function getContratosByCaso(casoId: string): Promise<ContratoConVinculos[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("documentos_generados").select(SELECT).eq("caso_id", casoId).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[] | null ?? []).map(shape);
}

/* Datos para autocompletar el generador */
export type ClienteGen = { id: string; nombre: string; tipo_documento: string; documento: string | null; direccion: string | null };
export type CasoGen = { id: string; titulo: string; tipo: string; parte_contraria: string | null; cliente_id: string; tribunal: string | null; expediente: string | null };

export async function getGeneradorData(): Promise<{ clientes: ClienteGen[]; casos: CasoGen[] }> {
  const admin = createAdminClient();
  const [cl, ca] = await Promise.all([
    admin.from("clientes").select("id, nombre, tipo_documento, documento, direccion").order("nombre"),
    admin.from("casos").select("id, titulo, tipo, parte_contraria, cliente_id, expedientes(numero, tribunal)").order("created_at", { ascending: false }),
  ]);
  if (cl.error) throw new Error(cl.error.message);
  if (ca.error) throw new Error(ca.error.message);
  const clientes = (cl.data as ClienteGen[] | null) ?? [];
  type CARow = { id: string; titulo: string; tipo: string; parte_contraria: string | null; cliente_id: string; expedientes: { numero: string; tribunal: string | null } | null };
  const casos = ((ca.data as unknown as CARow[] | null) ?? []).map((c) => ({
    id: c.id, titulo: c.titulo, tipo: c.tipo, parte_contraria: c.parte_contraria, cliente_id: c.cliente_id,
    tribunal: c.expedientes?.tribunal ?? null, expediente: c.expedientes?.numero ?? null,
  }));
  return { clientes, casos };
}
