"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/field";
import { PremiumButton } from "@/components/ui/premium-button";
import { FileIcon } from "./file-icon";
import { ACCEPT_ATTR, formatBytes, validateFile } from "@/lib/documentos";
import { cn } from "@/lib/utils";
import { TIPO_DOCUMENTO_LEGAL_LABEL, type Caso, type Cliente, type TipoDocumentoLegal } from "@/lib/db/types";

function uploadWithProgress(
  formData: FormData,
  onProgress: (pct: number) => void,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/documentos");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const r = JSON.parse(xhr.responseText);
        resolve(r.ok ? { ok: true } : { ok: false, error: r.error ?? "Error al subir." });
      } catch {
        resolve({ ok: false, error: "Respuesta inválida del servidor." });
      }
    };
    xhr.onerror = () => resolve({ ok: false, error: "Error de red durante la subida." });
    xhr.send(formData);
  });
}

export function UploadModal({
  open,
  onClose,
  casoId,
  clienteId,
  casos,
  clientes,
}: {
  open: boolean;
  onClose: () => void;
  casoId?: string;
  clienteId?: string;
  casos?: Pick<Caso, "id" | "titulo">[];
  clientes?: Pick<Cliente, "id" | "nombre">[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<TipoDocumentoLegal>("escrito");
  const [nombre, setNombre] = useState("");
  const [vinCaso, setVinCaso] = useState(casoId ?? "");
  const [vinCliente, setVinCliente] = useState(clienteId ?? "");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mostrarSelects = !casoId && !clienteId && (casos || clientes);

  function reset() {
    setFile(null);
    setNombre("");
    setProgress(0);
    setError(null);
    setUploading(false);
  }

  function pick(f: File | null) {
    if (!f) return;
    const err = validateFile({ type: f.type, size: f.size, name: f.name });
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
    if (!nombre) setNombre(f.name);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Selecciona un archivo.");
    setError(null);
    setUploading(true);
    setProgress(0);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("tipo_documento", tipo);
    fd.append("nombre", nombre.trim() || file.name);
    if (casoId || vinCaso) fd.append("caso_id", casoId ?? vinCaso);
    if ((clienteId || vinCliente) && !(casoId || vinCaso)) fd.append("cliente_id", clienteId ?? vinCliente);

    const res = await uploadWithProgress(fd, setProgress);
    if (!res.ok) {
      setError(res.error);
      setUploading(false);
      return;
    }
    router.refresh();
    reset();
    onClose();
  }

  function close() {
    if (uploading) return;
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      eyebrow="Subir documento"
      title="Nuevo documento"
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PremiumButton variant="ghost" onClick={close} type="button" disabled={uploading}>
            Cancelar
          </PremiumButton>
          <PremiumButton variant="gold" type="submit" form="upload-form" loading={uploading} disabled={!file}>
            Subir documento
          </PremiumButton>
        </div>
      }
    >
      <form id="upload-form" onSubmit={onSubmit} className="space-y-4">
        {/* Zona drag & drop */}
        {!file ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0] ?? null); }}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              dragging ? "border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_8%,transparent)]" : "border-border hover:border-[var(--gold)]/60",
            )}
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold">
              <UploadCloud className="h-7 w-7" strokeWidth={1.5} />
            </span>
            <span className="text-sm font-medium text-foreground">
              Arrastra un archivo o <span className="text-gold">selecciónalo</span>
            </span>
            <span className="text-xs text-muted-foreground">PDF, imagen o Word · máx. 15 MB</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-border p-3">
            <FileIcon mime={file.type} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs tabular text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            {!uploading && (
              <button type="button" onClick={reset} aria-label="Quitar archivo" className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />

        {/* Progreso real */}
        {uploading && (
          <div>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-muted-foreground">Subiendo…</span>
              <span className="tabular font-medium text-foreground">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--navy),var(--gold))] transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo de documento" htmlFor="tipo">
            <Select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoDocumentoLegal)}>
              {Object.entries(TIPO_DOCUMENTO_LEGAL_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </Field>
          <Field label="Nombre" htmlFor="nombre" hint="Por defecto, el nombre del archivo.">
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del documento" />
          </Field>
        </div>

        {mostrarSelects && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {casos && (
              <Field label="Vincular a caso" htmlFor="vcaso" hint="Opcional">
                <Select id="vcaso" value={vinCaso} onChange={(e) => { setVinCaso(e.target.value); if (e.target.value) setVinCliente(""); }}>
                  <option value="">— Sin caso —</option>
                  {casos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                </Select>
              </Field>
            )}
            {clientes && (
              <Field label="Vincular a cliente" htmlFor="vcli" hint={vinCaso ? "Se toma del caso" : "Opcional"}>
                <Select id="vcli" value={vinCliente} onChange={(e) => setVinCliente(e.target.value)} disabled={Boolean(vinCaso)}>
                  <option value="">— Sin cliente —</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </Select>
              </Field>
            )}
          </div>
        )}

        {error && <p className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">{error}</p>}
      </form>
    </Modal>
  );
}
