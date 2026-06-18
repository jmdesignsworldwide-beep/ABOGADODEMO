import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { accesoVencido, getCurrentPerfil } from "@/lib/auth";
import { validateFile } from "@/lib/documentos";

const BUCKET = "documentos";

/** Subida real de archivos a Supabase Storage (gateada por sesión activa). */
export async function POST(req: NextRequest) {
  // Seguridad: solo usuarios con sesión activa pueden subir.
  const perfil = await getCurrentPerfil();
  if (!perfil || !perfil.activo || accesoVencido(perfil)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const tipo = String(form.get("tipo_documento") ?? "otro");
  const casoId = (form.get("caso_id") as string) || null;
  let clienteId = (form.get("cliente_id") as string) || null;
  const nombrePersonalizado = (form.get("nombre") as string) || "";

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No se recibió ningún archivo." }, { status: 400 });
  }

  const errorValidacion = validateFile({ type: file.type, size: file.size, name: file.name });
  if (errorValidacion) {
    return NextResponse.json({ ok: false, error: errorValidacion }, { status: 400 });
  }

  const admin = createAdminClient();

  // Si viene de un caso, derivamos el cliente para que el documento aparezca
  // también en la ficha del cliente (mismo archivo, no duplicado).
  if (casoId) {
    const { data: caso } = await admin.from("casos").select("cliente_id").eq("id", casoId).maybeSingle();
    if (caso?.cliente_id) clienteId = caso.cliente_id;
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const scope = casoId ?? clienteId ?? "general";
  const path = `${scope}/${crypto.randomUUID()}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error: upErr } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) {
    return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
  }

  const { data: doc, error: insErr } = await admin
    .from("documentos")
    .insert({
      nombre: (nombrePersonalizado.trim() || file.name).slice(0, 200),
      tipo_documento: tipo,
      storage_path: path,
      mime_type: file.type || null,
      tamano: file.size,
      caso_id: casoId,
      cliente_id: clienteId,
      subido_por: perfil.id,
    })
    .select("id")
    .single();

  if (insErr) {
    // Rollback del archivo si falla el registro.
    await admin.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: doc.id });
}
