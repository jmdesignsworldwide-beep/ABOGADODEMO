import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentPerfil } from "@/lib/auth";

/**
 * Registra una acción en el historial de auditoría. Es resiliente: si falla
 * (p. ej. la tabla aún no existe), NO interrumpe la acción principal.
 */
export async function logAudit(accion: string, modulo: string, detalle: string): Promise<void> {
  try {
    const perfil = await getCurrentPerfil();
    const admin = createAdminClient();
    await admin.from("auditoria").insert({
      usuario: perfil?.username ?? "sistema",
      rol: perfil?.rol ?? null,
      accion,
      modulo,
      detalle,
    });
  } catch {
    // El log de auditoría nunca debe romper la operación del usuario.
  }
}
