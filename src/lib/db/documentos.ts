import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Caso, Cliente, Documento, DocumentoConVinculos } from "./types";

type Row = Documento & {
  casos: Pick<Caso, "id" | "titulo"> | null;
  clientes: Pick<Cliente, "id" | "nombre"> | null;
};

function shape(row: Row): DocumentoConVinculos {
  const { casos, clientes, ...doc } = row;
  return { ...doc, caso: casos ?? null, cliente: clientes ?? null };
}

const SELECT = "*, casos(id, titulo), clientes(id, nombre)";

export async function getDocumentos(): Promise<DocumentoConVinculos[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("documentos")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[] | null ?? []).map(shape);
}

export async function getDocumentoById(id: string): Promise<DocumentoConVinculos | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("documentos").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return shape(data as Row);
}

export async function getDocumentosByCaso(casoId: string): Promise<DocumentoConVinculos[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("documentos")
    .select(SELECT)
    .eq("caso_id", casoId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[] | null ?? []).map(shape);
}

export async function getDocumentosByCliente(clienteId: string): Promise<DocumentoConVinculos[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("documentos")
    .select(SELECT)
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[] | null ?? []).map(shape);
}
