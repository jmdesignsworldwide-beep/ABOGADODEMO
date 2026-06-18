"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { accesoVencido } from "@/lib/auth";
import { usernameToEmail } from "@/lib/username";

export type LoginResult = { ok: false; error: string };

/**
 * Login real con usuario + contraseña. El email es fantasma y nunca se expone.
 * Tras autenticar, valida en servidor que el acceso esté vigente; si no, cierra
 * sesión y manda a la pantalla de acceso expirado.
 */
export async function login(username: string, password: string): Promise<LoginResult> {
  const user = username.trim();
  if (!user || !password) return { ok: false, error: "Ingresa tu usuario y contraseña." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(user),
    password,
  });

  if (error || !data.user) {
    return { ok: false, error: "Usuario o contraseña incorrectos." };
  }

  // Validación de acceso en servidor (vencimiento / activo).
  const admin = createAdminClient();
  const { data: perfil } = await admin
    .from("perfiles")
    .select("activo, acceso_hasta, rol, username")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!perfil || !perfil.activo || accesoVencido(perfil)) {
    await supabase.auth.signOut();
    redirect("/acceso-expirado");
  }

  // Registro de auditoría (directo: la sesión recién creada aún no está en cookies).
  try {
    await admin.from("auditoria").insert({
      usuario: perfil.username ?? user,
      rol: perfil.rol ?? null,
      accion: "login",
      modulo: "Acceso",
      detalle: "Inició sesión en el sistema",
    });
  } catch {
    /* el log nunca debe impedir el acceso */
  }

  redirect("/panel");
}
