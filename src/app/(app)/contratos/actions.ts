"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

export async function guardarContrato(input: {
  plantilla: string;
  titulo: string;
  contenido: string;
  cliente_id: string | null;
  caso_id: string | null;
}): Promise<ActionResult> {
  const titulo = input.titulo?.trim();
  const contenido = input.contenido?.trim();
  if (!titulo) return { ok: false, error: "El título es obligatorio." };
  if (!contenido) return { ok: false, error: "El documento está vacío." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("documentos_generados")
    .insert({
      plantilla: input.plantilla,
      titulo: titulo.slice(0, 200),
      contenido,
      cliente_id: input.cliente_id || null,
      caso_id: input.caso_id || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/contratos");
  if (input.cliente_id) revalidatePath(`/clientes/${input.cliente_id}`);
  if (input.caso_id) revalidatePath(`/casos/${input.caso_id}`);
  return { ok: true, id: data.id };
}

export async function eliminarContrato(id: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const { error } = await admin.from("documentos_generados").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/contratos");
  return { ok: true };
}
