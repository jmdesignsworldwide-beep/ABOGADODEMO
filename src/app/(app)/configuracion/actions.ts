"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { isValidUsername, normalizeUsername, usernameToEmail } from "@/lib/username";

export type ActionResult = { ok: true } | { ok: false; error: string };

function accesoHastaFromDias(dias: number | null): string | null {
  if (dias === null) return null; // sin vencimiento
  return new Date(Date.now() + dias * 86_400_000).toISOString();
}

/** Crea una cuenta de cliente: usuario + contraseña + días de acceso. */
export async function crearUsuario(input: {
  username: string;
  password: string;
  dias: number | null;
}): Promise<ActionResult> {
  const admin_perfil = await requireAdmin();

  const username = normalizeUsername(input.username);
  if (!isValidUsername(username)) {
    return { ok: false, error: "Usuario inválido (3-30 caracteres: letras, números, . _ -)." };
  }
  if (!input.password || input.password.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const admin = createAdminClient();

  // Usuario único
  const { data: existe } = await admin.from("perfiles").select("id").eq("username", username).maybeSingle();
  if (existe) return { ok: false, error: "Ese usuario ya existe." };

  // Crea el usuario en Supabase Auth (email fantasma, confirmado).
  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password: input.password,
    email_confirm: true,
    user_metadata: { username },
  });
  if (authErr || !created.user) {
    return { ok: false, error: authErr?.message ?? "No se pudo crear la cuenta." };
  }

  // Crea el perfil
  const { error: perfErr } = await admin.from("perfiles").insert({
    id: created.user.id,
    username,
    rol: "cliente",
    acceso_hasta: accesoHastaFromDias(input.dias),
    activo: true,
    creado_por: admin_perfil.id,
  });
  if (perfErr) {
    // Rollback del usuario de auth si el perfil falla.
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: perfErr.message };
  }

  revalidatePath("/configuracion");
  return { ok: true };
}

/** Renueva / extiende (o quita vencimiento) y reactiva la cuenta. */
export async function extenderAcceso(id: string, dias: number | null): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();

  let acceso_hasta: string | null;
  if (dias === null) {
    acceso_hasta = null; // sin vencimiento
  } else {
    const { data } = await admin.from("perfiles").select("acceso_hasta").eq("id", id).maybeSingle();
    const actual = data?.acceso_hasta ? new Date(data.acceso_hasta).getTime() : 0;
    const base = Math.max(Date.now(), actual);
    acceso_hasta = new Date(base + dias * 86_400_000).toISOString();
  }

  const { error } = await admin.from("perfiles").update({ acceso_hasta, activo: true }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracion");
  return { ok: true };
}

/** Activa o desactiva una cuenta (bloqueo inmediato). */
export async function setActivo(id: string, activo: boolean): Promise<ActionResult> {
  const admin_perfil = await requireAdmin();
  if (id === admin_perfil.id) return { ok: false, error: "No puedes desactivar tu propia cuenta de admin." };
  const admin = createAdminClient();
  const { error } = await admin.from("perfiles").update({ activo }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracion");
  return { ok: true };
}

/** Elimina una cuenta por completo (auth + perfil por cascada). */
export async function eliminarUsuario(id: string): Promise<ActionResult> {
  const admin_perfil = await requireAdmin();
  if (id === admin_perfil.id) return { ok: false, error: "No puedes eliminar tu propia cuenta de admin." };
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracion");
  return { ok: true };
}
