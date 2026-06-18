"use server";

import { logAudit } from "@/lib/audit";

/** "Fuerza" un respaldo (demostración). Registra la acción en auditoría. */
export async function forzarRespaldo(): Promise<{ ok: true; fecha: string }> {
  await logAudit("respaldo", "Respaldo", "Forzó un respaldo manual de la base de datos");
  return { ok: true, fecha: new Date().toISOString() };
}
