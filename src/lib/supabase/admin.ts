import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente ADMIN de Supabase — SOLO SERVIDOR.
 *
 * Usa la SERVICE_ROLE key, que SALTA todas las reglas de seguridad (RLS)
 * y tiene control total de la base de datos.
 *
 * ⚠️ NUNCA importes este archivo en un Client Component. El import
 * "server-only" de arriba hace que el build falle si alguien lo intenta,
 * protegiéndote de filtrar la llave secreta al navegador.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
