"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import type { RecordatorioInput } from "@/lib/db/types";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

function sanitize(input: RecordatorioInput): RecordatorioInput | string {
  const titulo = input.titulo?.trim();
  if (!titulo) return "El título es obligatorio.";
  if (!input.fecha) return "La fecha es obligatoria.";
  return {
    titulo,
    fecha: input.fecha,
    caso_id: input.caso_id || null,
    nota: (input.nota ?? "").trim() || null,
  };
}

export async function crearRecordatorio(input: RecordatorioInput): Promise<ActionResult> {
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };
  const admin = createAdminClient();
  const { data, error } = await admin.from("recordatorios").insert(clean).select("id").single();
  if (error) return { ok: false, error: error.message };
  await logAudit("crear", "Recordatorios", `Creó el recordatorio "${clean.titulo}"`);
  revalidatePath("/recordatorios");
  return { ok: true, id: data.id };
}

export async function actualizarRecordatorio(id: string, input: RecordatorioInput): Promise<ActionResult> {
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };
  const admin = createAdminClient();
  const { error } = await admin.from("recordatorios").update(clean).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logAudit("editar", "Recordatorios", `Editó el recordatorio "${clean.titulo}"`);
  revalidatePath("/recordatorios");
  return { ok: true, id };
}

export async function toggleCompletado(id: string, completado: boolean): Promise<ActionResult> {
  const admin = createAdminClient();
  const { error } = await admin.from("recordatorios").update({ completado }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logAudit("editar", "Recordatorios", completado ? "Marcó un recordatorio como completado" : "Reabrió un recordatorio");
  revalidatePath("/recordatorios");
  return { ok: true, id };
}

export async function eliminarRecordatorio(id: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const { error } = await admin.from("recordatorios").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logAudit("eliminar", "Recordatorios", "Eliminó un recordatorio");
  revalidatePath("/recordatorios");
  return { ok: true };
}
