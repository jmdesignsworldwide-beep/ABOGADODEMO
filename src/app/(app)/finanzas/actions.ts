"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EgresoInput } from "@/lib/db/types";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const CATEGORIAS = [
  "alquiler", "salarios", "servicios", "suministros", "impuestos",
  "honorarios_terceros", "marketing", "mantenimiento", "otros",
];

function sanitize(input: EgresoInput): EgresoInput | string {
  const concepto = input.concepto?.trim();
  if (!concepto) return "El concepto es obligatorio.";
  if (!CATEGORIAS.includes(input.categoria)) return "Categoría inválida.";
  const monto = Number(input.monto);
  if (Number.isNaN(monto) || monto < 0) return "El monto debe ser un número válido.";
  if (!input.fecha) return "La fecha es obligatoria.";
  const desc = (input.descripcion ?? "").trim();
  return { concepto, categoria: input.categoria, monto: Math.round(monto * 100) / 100, fecha: input.fecha, descripcion: desc || null };
}

export async function crearEgreso(input: EgresoInput): Promise<ActionResult> {
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };
  const admin = createAdminClient();
  const { data, error } = await admin.from("egresos").insert(clean).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/finanzas");
  return { ok: true, id: data.id };
}

export async function actualizarEgreso(id: string, input: EgresoInput): Promise<ActionResult> {
  const clean = sanitize(input);
  if (typeof clean === "string") return { ok: false, error: clean };
  const admin = createAdminClient();
  const { error } = await admin.from("egresos").update(clean).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/finanzas");
  return { ok: true, id };
}

export async function eliminarEgreso(id: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const { error } = await admin.from("egresos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/finanzas");
  return { ok: true };
}
