"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumButton } from "@/components/ui/premium-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DocumentoCard } from "./documento-card";
import { DocumentoDetalleModal } from "./documento-detalle-modal";
import { UploadModal } from "./upload-modal";
import { deleteDocumento } from "@/app/(app)/documentos/actions";
import {
  TIPO_DOCUMENTO_LEGAL_LABEL,
  type Caso,
  type Cliente,
  type DocumentoConVinculos,
  type TipoDocumentoLegal,
} from "@/lib/db/types";

export function DocumentosView({
  documentos,
  casos,
  clientes,
}: {
  documentos: DocumentoConVinculos[];
  casos: Pick<Caso, "id" | "titulo">[];
  clientes: Pick<Cliente, "id" | "nombre">[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState<TipoDocumentoLegal | "todos">("todos");
  const [casoFiltro, setCasoFiltro] = useState("todos");
  const [clienteFiltro, setClienteFiltro] = useState("todos");
  const [subiendo, setSubiendo] = useState(false);
  const [selected, setSelected] = useState<DocumentoConVinculos | null>(null);
  const [eliminando, setEliminando] = useState<DocumentoConVinculos | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documentos.filter((d) => {
      if (tipo !== "todos" && d.tipo_documento !== tipo) return false;
      if (casoFiltro !== "todos" && d.caso_id !== casoFiltro) return false;
      if (clienteFiltro !== "todos" && d.cliente_id !== clienteFiltro) return false;
      if (!q) return true;
      return [d.nombre, d.caso?.titulo, d.cliente?.nombre].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [documentos, query, tipo, casoFiltro, clienteFiltro]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centro de Documentos"
        subtitle={`${documentos.length} ${documentos.length === 1 ? "documento" : "documentos"} en el bufete`}
        action={
          <PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setSubiendo(true)}>
            Subir documento
          </PremiumButton>
        }
      />

      {/* Búsqueda + filtros */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar documento…" className="pl-11" aria-label="Buscar documentos" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoDocumentoLegal | "todos")} aria-label="Filtrar por tipo" className="lg:w-36">
            <option value="todos">Todos los tipos</option>
            {Object.entries(TIPO_DOCUMENTO_LEGAL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Select value={casoFiltro} onChange={(e) => setCasoFiltro(e.target.value)} aria-label="Filtrar por caso" className="lg:w-44">
            <option value="todos">Todos los casos</option>
            {casos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
          </Select>
          <Select value={clienteFiltro} onChange={(e) => setClienteFiltro(e.target.value)} aria-label="Filtrar por cliente" className="lg:w-44">
            <option value="todos">Todos los clientes</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Select>
        </div>
      </div>

      {documentos.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aún no hay documentos"
          description="Sube tu primer documento y vincúlalo a un caso o cliente."
          action={<PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setSubiendo(true)}>Subir documento</PremiumButton>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description="Ajusta la búsqueda o los filtros." />
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <StaggerItem key={d.id} className="h-full">
              <DocumentoCard documento={d} onClick={() => setSelected(d)} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <UploadModal open={subiendo} onClose={() => setSubiendo(false)} casos={casos} clientes={clientes} />
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
