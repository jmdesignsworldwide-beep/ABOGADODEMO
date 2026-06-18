"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/lib/auth";
import type { AudienciaInput } from "@/lib/db/types";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const TIPOS = ["audiencia", "cita"];
const ESTADOS = ["programada", "confirmada", "realizada", "cancelada", "aplazada"];

function sanitize(input: AudienciaInput): AudienciaInput | string {
  const titulo = input.titulo?.trim();
  if (!titulo) return "El título es obligatorio.";
  if (!input.caso_id) return "Debes vincular la audiencia/cita a un caso.";
  if (!input.fecha) return "La fecha es obligatoria.";
  if (!TIPOS.includes(input.tipo)) return "Tipo inválido.";
  if (!ESTADOS.includes(input.estado)) return "Estado inválido.";
  const clean = (v: string | null) => {
    const t = (v ?? "").trim();
    return t === "" ? null : t;
  };
  return {
    caso_id: input.caso_id,
    tipo: input.tipo,
    titulo,
    fecha: input.fecha,
    hora: clean(input.hora),
    lugar: clean(input.lugar),
    estado: input.estado,
    notas: clean(input.notas),
  };
}

export async function createAudiencia(input: AudienciaInput): Promise<ActionResult> {
  await requireActiveUser();
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("audiencias_citas").insert(clean).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/agenda");
  revalidatePath(`/casos/${clean.caso_id}`);
  return { ok: true, id: data.id };
}

export async function updateAudiencia(id: string, input: AudienciaInput): Promise<ActionResult> {
  await requireActiveUser();
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };
  const supabase = createAdminClient();
  const { error } = await supabase.from("audiencias_citas").update(clean).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/agenda");
  revalidatePath(`/casos/${clean.caso_id}`);
  return { ok: true, id };
}

export async function deleteAudiencia(id: string): Promise<ActionResult> {
  await requireActiveUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("audiencias_citas").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/agenda");
  return { ok: true };
}
