"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/lib/auth";
import { calcularTotales, siguienteNCF } from "@/lib/facturas";
import { logAudit } from "@/lib/audit";
import type { FacturaEstado, FacturaInput } from "@/lib/db/types";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const TIPOS = ["B01", "B02"];
const ESTADOS = ["pendiente", "pagada", "anulada"];

export async function crearFactura(input: FacturaInput): Promise<ActionResult> {
  await requireActiveUser();
  if (!input.cliente_id) return { ok: false, error: "Debes seleccionar un cliente." };
  if (!TIPOS.includes(input.tipo_ncf)) return { ok: false, error: "Tipo de NCF inválido." };
  if (!input.fecha) return { ok: false, error: "La fecha es obligatoria." };

  const conceptos = (input.conceptos ?? [])
    .map((c) => ({
      descripcion: (c.descripcion ?? "").trim(),
      cantidad: Number(c.cantidad) || 0,
      precio: Number(c.precio) || 0,
    }))
    .filter((c) => c.descripcion && c.cantidad > 0);

  if (conceptos.length === 0) {
    return { ok: false, error: "Agrega al menos un concepto con descripción y cantidad." };
  }

  const { subtotal, itbis, total } = calcularTotales(conceptos);
  const admin = createAdminClient();

  // NCF secuencial por tipo (basado en el último emitido).
  const { data: ultima } = await admin
    .from("facturas")
    .select("numero")
    .eq("tipo_ncf", input.tipo_ncf)
    .order("numero", { ascending: false })
    .limit(1)
    .maybeSingle();
  const numero = siguienteNCF(input.tipo_ncf, ultima?.numero ?? null);

  const { data, error } = await admin
    .from("facturas")
    .insert({
      numero,
      tipo_ncf: input.tipo_ncf,
      cliente_id: input.cliente_id,
      caso_id: input.caso_id || null,
      conceptos,
      subtotal,
      itbis,
      total,
      estado: ESTADOS.includes(input.estado) ? input.estado : "pendiente",
      fecha: input.fecha,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  await logAudit("crear", "Facturación", `Emitió la factura ${numero}`);
  revalidatePath("/facturacion");
  return { ok: true, id: data.id };
}

export async function cambiarEstadoFactura(id: string, estado: FacturaEstado): Promise<ActionResult> {
  await requireActiveUser();
  if (!ESTADOS.includes(estado)) return { ok: false, error: "Estado inválido." };
  const admin = createAdminClient();
  const { error } = await admin.from("facturas").update({ estado }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logAudit("editar", "Facturación", `Cambió el estado de una factura a "${estado}"`);
  revalidatePath("/facturacion");
  revalidatePath(`/facturacion/${id}`);
  return { ok: true, id };
}

export async function deleteFactura(id: string): Promise<ActionResult> {
  await requireActiveUser();
  const admin = createAdminClient();
  const { error } = await admin.from("facturas").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logAudit("eliminar", "Facturación", "Eliminó una factura");
  revalidatePath("/facturacion");
  return { ok: true };
}
