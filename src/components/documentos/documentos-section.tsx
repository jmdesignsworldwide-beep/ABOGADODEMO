"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRouter } from "next/navigation";
import { DocumentoCard } from "./documento-card";
import { DocumentoDetalleModal } from "./documento-detalle-modal";
import { UploadModal } from "./upload-modal";
import { deleteDocumento } from "@/app/(app)/documentos/actions";
import type { DocumentoConVinculos } from "@/lib/db/types";

/**
 * Sección de documentos reutilizable dentro de un caso o un cliente.
 * Sube y muestra lo asociado a ese contexto; el mismo archivo aparece también
 * en el Centro de Documentos (no se duplica).
 */
export function DocumentosSection({
  documentos,
  casoId,
  clienteId,
  contextoLabel,
}: {
  documentos: DocumentoConVinculos[];
  casoId?: string;
  clienteId?: string;
  contextoLabel: string;
}) {
  const router = useRouter();
  const [subiendo, setSubiendo] = useState(false);
  const [selected, setSelected] = useState<DocumentoConVinculos | null>(null);
  const [eliminando, setEliminando] = useState<DocumentoConVinculos | null>(null);

  return (
    <div className="rounded-2xl glass p-5 shadow-layered">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
          <FileText className="h-5 w-5 text-gold" /> Documentos
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular text-muted-foreground">
            {documentos.length}
          </span>
        </h3>
        <button
          type="button"
          onClick={() => setSubiendo(true)}
          className="inline-flex items-center gap-1 text-sm font-medium text-gold transition-opacity hover:opacity-80"
        >
          <Plus className="h-4 w-4" /> Subir
        </button>
      </div>

      {documentos.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Aún no hay documentos en {contextoLabel}.
        </p>
      ) : (
        <Stagger className="mt-4 grid grid-cols-1 gap-3">
          {documentos.map((d) => (
            <StaggerItem key={d.id}>
              <DocumentoCard documento={d} onClick={() => setSelected(d)} mostrarVinculo={false} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <UploadModal open={subiendo} onClose={() => setSubiendo(false)} casoId={casoId} clienteId={clienteId} />
      <DocumentoDetalleModal
        documento={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onDelete={() => { setEliminando(selected); setSelected(null); }}
      />
      <ConfirmDialog
        open={Boolean(eliminando)}
        onClose={() => setEliminando(null)}
        title="Eliminar documento"
        description={`Se eliminará “${eliminando?.nombre ?? ""}” y su archivo. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          if (!eliminando) return { ok: false, error: "Sin selección" };
          const res = await deleteDocumento(eliminando.id);
          if (res.ok) router.refresh();
          return res;
        }}
      />
    </div>
  );
}
