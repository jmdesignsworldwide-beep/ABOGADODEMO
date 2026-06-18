"use server";

import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

/** "Fuerza" un respaldo (demostración). Solo admin. Registra la acción. */
export async function forzarRespaldo(): Promise<{ ok: true; fecha: string }> {
  await requireAdmin();
  await logAudit("respaldo", "Respaldo", "Forzó un respaldo manual de la base de datos");
  return { ok: true, fecha: new Date().toISOString() };
}
