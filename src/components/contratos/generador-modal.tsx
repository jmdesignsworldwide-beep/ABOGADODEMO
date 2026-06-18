"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/field";
import { PremiumButton } from "@/components/ui/premium-button";
import { guardarContrato } from "@/app/(app)/contratos/actions";
import { descargarContratoPDF } from "@/lib/contrato-pdf";
import {
  PLANTILLAS,
  PLANTILLA_LABEL,
  generarContenido,
  type DatosContrato,
  type PlantillaKey,
} from "@/lib/contratos/templates";
import type { CasoGen, ClienteGen } from "@/lib/db/contratos";

export function GeneradorModal({
  open,
  onClose,
  clientes,
  casos,
  defaultClienteId,
  defaultCasoId,
}: {
  open: boolean;
  onClose: () => void;
  clientes: ClienteGen[];
  casos: CasoGen[];
  defaultClienteId?: string;
  defaultCasoId?: string;
}) {
  const router = useRouter();

  function buildDatos(cId: string, caId: string): DatosContrato {
    const cliente = clientes.find((c) => c.id === cId);
    const caso = casos.find((c) => c.id === caId);
    return {
      cliente: cliente ? { nombre: cliente.nombre, tipoDoc: cliente.tipo_documento, documento: cliente.documento, direccion: cliente.direccion } : null,
      caso: caso ? { titulo: caso.titulo, tipo: caso.tipo, parteContraria: caso.parte_contraria, tribunal: caso.tribunal, expediente: caso.expediente } : null,
      ciudad: "Santo Domingo",
    };
  }
  function tituloDe(p: PlantillaKey, cId: string): string {
    const c = clientes.find((x) => x.id === cId);
    return `${PLANTILLA_LABEL[p]}${c ? " — " + c.nombre : ""}`;
  }

  const p0: PlantillaKey = PLANTILLAS[0].key;
  const c0 = defaultClienteId ?? "";
  const ca0 = defaultCasoId ?? "";

  const [plantilla, setPlantilla] = useState<PlantillaKey>(p0);
  const [clienteId, setClienteId] = useState(c0);
  const [casoId, setCasoId] = useState(ca0);
  const [titulo, setTitulo] = useState(() => tituloDe(p0, c0));
  const [contenido, setContenido] = useState(() => generarContenido(p0, buildDatos(c0, ca0)));
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function regen(p: PlantillaKey, cId: string, caId: string, force = false) {
    if (touched && !force) return;
    setContenido(generarContenido(p, buildDatos(cId, caId)));
    setTitulo(tituloDe(p, cId));
    if (force) setTouched(false);
  }

  function onPlantilla(p: PlantillaKey) { setPlantilla(p); regen(p, clienteId, casoId); }
  function onCliente(id: string) { setClienteId(id); regen(plantilla, id, casoId); }
  function onCaso(id: string) {
    const caso = casos.find((c) => c.id === id);
    const cId = caso ? caso.cliente_id : clienteId; // el caso fija su cliente
    setCasoId(id);
    if (caso) setClienteId(cId);
    regen(plantilla, cId, id);
  }

  const clienteNombre = clientes.find((c) => c.id === clienteId)?.nombre;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!titulo.trim()) return setError("El título es obligatorio.");
    if (!contenido.trim()) return setError("El documento está vacío.");
    setLoading(true);
    const res = await guardarContrato({ plantilla, titulo, contenido, cliente_id: clienteId || null, caso_id: casoId || null });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    descargarContratoPDF(titulo, contenido);
    router.refresh();
    onClose();
  }

  // Filtra casos por cliente seleccionado (si hay) para coherencia.
  const casosVisibles = clienteId ? casos.filter((c) => c.cliente_id === clienteId) : casos;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Generar documento"
      title="Nuevo documento"
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PremiumButton variant="ghost" onClick={onClose} type="button">Cancelar</PremiumButton>
          <PremiumButton variant="gold" type="submit" form="gen-form" loading={loading}>Generar PDF y guardar</PremiumButton>
        </div>
      }
    >
      <form id="gen-form" onSubmit={onSubmit} className="space-y-4">
        <Field label="Plantilla" htmlFor="plantilla" required>
          <Select id="plantilla" value={plantilla} onChange={(e) => onPlantilla(e.target.value as PlantillaKey)}>
            {PLANTILLAS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </Select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cliente" htmlFor="cliente">
            <Select id="cliente" value={clienteId} onChange={(e) => onCliente(e.target.value)} disabled={Boolean(defaultClienteId)}>
              <option value="">— Seleccionar —</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Caso (opcional)" htmlFor="caso">
            <Select id="caso" value={casoId} onChange={(e) => onCaso(e.target.value)} disabled={Boolean(defaultCasoId)}>
              <option value="">— Sin caso —</option>
              {casosVisibles.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Título del documento" htmlFor="titulo" required>
          <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </Field>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="contenido" className="text-sm font-medium text-foreground">Documento</label>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-gold">
                <Sparkles className="h-3.5 w-3.5" />
                {clienteNombre ? `Autocompletado con ${clienteNombre}` : "Autocompletado"}
              </span>
              <button type="button" onClick={() => regen(plantilla, clienteId, casoId, true)} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                <RefreshCw className="h-3.5 w-3.5" /> Volver a autocompletar
              </button>
            </div>
          </div>
          <textarea
            id="contenido"
            value={contenido}
            onChange={(e) => { setContenido(e.target.value); setTouched(true); }}
            rows={14}
            className="w-full rounded-xl border border-border bg-background/40 px-3.5 py-2.5 font-mono text-[13px] leading-relaxed text-foreground outline-none transition-colors focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--ring)]"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">Puedes editar el texto antes de generar. El PDF llevará el membrete del bufete y el aviso de demostración al pie.</p>
        </div>

        {error && <p className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">{error}</p>}
      </form>
    </Modal>
  );
}
