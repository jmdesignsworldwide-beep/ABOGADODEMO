"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ClienteInput } from "@/lib/db/types";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const TIPOS = ["persona", "empresa"];
const DOCS = ["cedula", "rnc", "pasaporte"];

function sanitize(input: ClienteInput): ClienteInput | string {
  const nombre = input.nombre?.trim();
  if (!nombre) return "El nombre es obligatorio.";
  if (!TIPOS.includes(input.tipo)) return "Tipo de cliente inválido.";
  if (!DOCS.includes(input.tipo_documento)) return "Tipo de documento inválido.";
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return "El correo no tiene un formato válido.";
  }
  const clean = (v: string | null) => {
    const t = (v ?? "").trim();
    return t === "" ? null : t;
  };
  return {
    nombre,
    tipo: input.tipo,
    tipo_documento: input.tipo_documento,
    documento: clean(input.documento),
    email: clean(input.email),
    telefono: clean(input.telefono),
    direccion: clean(input.direccion),
    notas: clean(input.notas),
  };
}

export async function createCliente(input: ClienteInput): Promise<ActionResult> {
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clientes")
    .insert(clean)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/clientes");
  return { ok: true, id: data.id };
}

export async function updateCliente(id: string, input: ClienteInput): Promise<ActionResult> {
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };

  const supabase = createAdminClient();
  const { error } = await supabase.from("clientes").update(clean).eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { ok: true, id };
}

export async function deleteCliente(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("clientes").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/clientes");
  return { ok: true };
}
