"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Download, FileType2, Scale, Trash2, User } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { PremiumButton } from "@/components/ui/premium-button";
import { FileIcon } from "./file-icon";
import { getDownloadUrl, getPreviewUrl } from "@/app/(app)/documentos/actions";
import { formatBytes, isImage } from "@/lib/documentos";
import { TIPO_DOCUMENTO_LEGAL_LABEL, type DocumentoConVinculos } from "@/lib/db/types";

function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });
}

export function DocumentoDetalleModal({
  documento,
  open,
  onClose,
  onDelete,
}: {
  documento: DocumentoConVinculos | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [preview, setPreview] = useState<{ id: string; url: string } | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!(open && documento && isImage(documento.mime_type))) return;
    let active = true;
    getPreviewUrl(documento.id).then((r) => {
      if (active && r.ok) setPreview({ id: documento.id, url: r.url });
    });
    return () => {
      active = false;
    };
  }, [open, documento]);

  if (!documento) return null;
  const previewUrl = preview?.id === documento.id ? preview.url : null;

  async function descargar() {
    if (!documento) return;
    setDownloading(true);
    const res = await getDownloadUrl(documento.id);
    setDownloading(false);
    if (res.ok) window.location.href = res.url;
  }

  const meta = [
    { icon: FileType2, label: "Tipo", value: TIPO_DOCUMENTO_LEGAL_LABEL[documento.tipo_documento] },
    { icon: CalendarDays, label: "Subido", value: fechaLarga(documento.created_at) },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Documento"
      title={documento.nombre}
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between">
          <PremiumButton variant="ghost" onClick={onDelete} leftIcon={<Trash2 className="h-4 w-4" />} type="button">
            Eliminar
          </PremiumButton>
          <PremiumButton variant="gold" onClick={descargar} loading={downloading} leftIcon={<Download className="h-4 w-4" />} type="button">
            Descargar
          </PremiumButton>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Vista previa / icono */}
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={documento.nombre} className="max-h-64 w-full rounded-xl border border-border object-contain" />
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-border p-4">
            <FileIcon mime={documento.mime_type} size="lg" />
            <div>
              <p className="text-sm font-medium text-foreground">{documento.nombre}</p>
              <p className="text-xs tabular text-muted-foreground">{formatBytes(documento.tamano)}</p>
            </div>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
          {meta.map((m) => (
            <div key={m.label} className="bg-surface p-3.5">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{m.label}</dt>
              <dd className="mt-0.5 text-sm text-foreground">{m.value}</dd>
            </div>
          ))}
          <div className="bg-surface p-3.5">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Tamaño</dt>
            <dd className="mt-0.5 text-sm tabular text-foreground">{formatBytes(documento.tamano)}</dd>
          </div>
          <div className="bg-surface p-3.5">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Formato</dt>
            <dd className="mt-0.5 truncate text-sm text-foreground">{documento.mime_type ?? "—"}</dd>
          </div>
        </dl>

        {/* Vínculos clickeables */}
        {(documento.caso || documento.cliente) && (
          <div className="space-y-2">
            {documento.caso && (
              <Link href={`/casos/${documento.caso.id}`} className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/60">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold"><Scale className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{documento.caso.titulo}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
            {documento.cliente && (
              <Link href={`/clientes/${documento.cliente.id}`} className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/60">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--navy)_18%,transparent)] text-foreground"><User className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{documento.cliente.nombre}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
