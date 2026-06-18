import { redirect } from "next/navigation";

/**
 * Raíz: por ahora redirige al login. Cuando conectemos Supabase Auth,
 * aquí decidiremos según la sesión (login vs. panel).
 */
export default function RootPage() {
  redirect("/login");
}
