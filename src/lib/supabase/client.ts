import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para el NAVEGADOR (Client Components).
 * Usa la anon key pública. Las reglas de seguridad (RLS) de tu base
 * de datos protegen los datos. Seguro para el lado del cliente.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
