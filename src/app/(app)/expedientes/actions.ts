"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExpedienteInput } from "@/lib/db/types";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

function sanitize(input: ExpedienteInput): ExpedienteInput | string {
  const numero = input.numero?.trim();
  if (!numero) return "El número de expediente es obligatorio.";
  if (!input.caso_id) return "Debes vincular el expediente a un caso.";
  const clean = (v: string | null) => {
    const t = (v ?? "").trim();
    return t === "" ? null : t;
  };
  return {
    caso_id: input.caso_id,
    numero,
    tribunal: clean(input.tribunal),
    juez: clean(input.juez),
    estado_procesal: clean(input.estado_procesal),
  };
}

export async function createExpediente(input: ExpedienteInput): Promise<ActionResult> {
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("expedientes").insert(clean).select("id").single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ese caso ya tiene un expediente." };
    return { ok: false, error: error.message };
  }
  revalidatePath("/expedientes");
  revalidatePath(`/casos/${clean.caso_id}`);
  return { ok: true, id: data.id };
}

export async function updateExpediente(id: string, input: ExpedienteInput): Promise<ActionResult> {
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };
  const supabase = createAdminClient();
  const { error } = await supabase.from("expedientes").update(clean).eq("id", id);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ese caso ya tiene un expediente." };
    return { ok: false, error: error.message };
  }
  revalidatePath("/expedientes");
  revalidatePath(`/expedientes/${id}`);
  revalidatePath(`/casos/${clean.caso_id}`);
  return { ok: true, id };
}

export async function deleteExpediente(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("expedientes").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/expedientes");
  return { ok: true };
}
