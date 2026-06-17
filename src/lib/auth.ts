import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type Perfil = {
  id: string;
  username: string;
  rol: "admin" | "cliente";
  acceso_hasta: string | null;
  activo: boolean;
};

/** Usuario autenticado actual (sesión por cookies), o null. */
export async function getSessionUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Perfil del usuario actual (vía service_role), o null si no hay sesión. */
export async function getCurrentPerfil(): Promise<Perfil | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("perfiles")
    .select("id, username, rol, acceso_hasta, activo")
    .eq("id", userId)
    .maybeSingle();
  return (data as Perfil | null) ?? null;
}

/** ¿El acceso está vencido? (servidor, no se puede saltar). */
export function accesoVencido(perfil: Pick<Perfil, "acceso_hasta">): boolean {
  if (!perfil.acceso_hasta) return false; // sin vencimiento
  return new Date(perfil.acceso_hasta).getTime() < Date.now();
}

/**
 * Exige una sesión válida y con acceso vigente. Redirige si no:
 *  - sin sesión / sin perfil  → /login
 *  - inactivo o vencido       → /acceso-expirado
 * Devuelve el perfil para usarlo en el layout/páginas.
 */
export async function requireActiveUser(): Promise<Perfil> {
  const perfil = await getCurrentPerfil();
  if (!perfil) redirect("/login");
  if (!perfil.activo || accesoVencido(perfil)) redirect("/acceso-expirado");
  return perfil;
}

/** Exige rol admin. Si no es admin (o no hay acceso), bloquea. */
export async function requireAdmin(): Promise<Perfil> {
  const perfil = await requireActiveUser();
  if (perfil.rol !== "admin") redirect("/panel");
  return perfil;
}

/** Días restantes de acceso (null = sin vencimiento, negativo = vencido). */
export function diasRestantes(acceso_hasta: string | null): number | null {
  if (!acceso_hasta) return null;
  const ms = new Date(acceso_hasta).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}
