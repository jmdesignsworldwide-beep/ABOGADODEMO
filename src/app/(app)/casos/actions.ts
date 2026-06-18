"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import type { CasoInput } from "@/lib/db/types";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const TIPOS = ["civil", "penal", "laboral", "comercial", "divorcio", "sucesiones", "inmobiliario"];
const ESTADOS = ["abierto", "en_proceso", "suspendido", "cerrado", "archivado"];

function sanitize(input: CasoInput): CasoInput | string {
  const titulo = input.titulo?.trim();
  if (!titulo) return "El título del caso es obligatorio.";
  if (!input.cliente_id) return "Debes seleccionar un cliente.";
  if (!TIPOS.includes(input.tipo)) return "Tipo de caso inválido.";
  if (!ESTADOS.includes(input.estado)) return "Estado inválido.";
  const avance = Number(input.avance);
  if (Number.isNaN(avance) || avance < 0 || avance > 100) return "El avance debe estar entre 0 y 100.";
  const clean = (v: string | null) => {
    const t = (v ?? "").trim();
    return t === "" ? null : t;
  };
  return {
    cliente_id: input.cliente_id,
    titulo,
    tipo: input.tipo,
    estado: input.estado,
    abogado: clean(input.abogado),
    parte_contraria: clean(input.parte_contraria),
    avance: Math.round(avance),
    descripcion: clean(input.descripcion),
  };
}

export async function createCaso(input: CasoInput): Promise<ActionResult> {
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("casos").insert(clean).select("id").single();
  if (error) return { ok: false, error: error.message };
  await logAudit("crear", "Casos", `Creó el caso "${clean.titulo}"`);
  revalidatePath("/casos");
  revalidatePath(`/clientes/${clean.cliente_id}`);
  return { ok: true, id: data.id };
}

export async function updateCaso(id: string, input: CasoInput): Promise<ActionResult> {
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };
  const supabase = createAdminClient();
  const { error } = await supabase.from("casos").update(clean).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logAudit("editar", "Casos", `Actualizó el caso "${clean.titulo}"`);
  revalidatePath("/casos");
  revalidatePath(`/casos/${id}`);
  revalidatePath(`/clientes/${clean.cliente_id}`);
  return { ok: true, id };
}

export async function deleteCaso(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("casos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logAudit("eliminar", "Casos", "Eliminó un caso");
  revalidatePath("/casos");
  return { ok: true };
}
