import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type PerfilAdmin = {
  id: string;
  username: string;
  rol: "admin" | "cliente";
  acceso_hasta: string | null;
  activo: boolean;
  created_at: string;
};

/** Lista todas las cuentas (solo se invoca desde rutas admin). */
export async function getPerfiles(): Promise<PerfilAdmin[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("perfiles")
    .select("id, username, rol, acceso_hasta, activo, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as PerfilAdmin[] | null) ?? [];
}
