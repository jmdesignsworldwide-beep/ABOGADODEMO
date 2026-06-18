"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { accesoVencido, getCurrentPerfil } from "@/lib/auth";

const BUCKET = "documentos";

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

async function ensureActive(): Promise<string | null> {
  const perfil = await getCurrentPerfil();
  if (!perfil || !perfil.activo || accesoVencido(perfil)) return null;
  return perfil.id;
}

/** URL firmada de descarga (60s), solo para usuarios con sesión activa. */
export async function getDownloadUrl(id: string): Promise<Result<{ url: string }>> {
  if (!(await ensureActive())) return { ok: false, error: "No autorizado." };
  const admin = createAdminClient();
  const { data: doc } = await admin
    .from("documentos")
    .select("storage_path, nombre")
    .eq("id", id)
    .maybeSingle();
  if (!doc) return { ok: false, error: "Documento no encontrado." };

  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(doc.storage_path, 60, { download: doc.nombre });
  if (error || !data) return { ok: false, error: error?.message ?? "No se pudo generar la descarga." };
  return { ok: true, url: data.signedUrl };
}

/** URL firmada para previsualizar (imágenes) en línea. */
export async function getPreviewUrl(id: string): Promise<Result<{ url: string }>> {
  if (!(await ensureActive())) return { ok: false, error: "No autorizado." };
  const admin = createAdminClient();
  const { data: doc } = await admin.from("documentos").select("storage_path").eq("id", id).maybeSingle();
  if (!doc) return { ok: false, error: "Documento no encontrado." };
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(doc.storage_path, 120);
  if (error || !data) return { ok: false, error: error?.message ?? "No se pudo generar la vista previa." };
  return { ok: true, url: data.signedUrl };
}

/** Elimina el archivo de Storage y su registro. */
export async function deleteDocumento(id: string): Promise<Result> {
  if (!(await ensureActive())) return { ok: false, error: "No autorizado." };
  const admin = createAdminClient();
  const { data: doc } = await admin.from("documentos").select("storage_path").eq("id", id).maybeSingle();
  if (!doc) return { ok: false, error: "Documento no encontrado." };

  await admin.storage.from(BUCKET).remove([doc.storage_path]);
  const { error } = await admin.from("documentos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/documentos");
  return { ok: true };
}
