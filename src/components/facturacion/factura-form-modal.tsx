"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/field";
import { PremiumButton } from "@/components/ui/premium-button";
import { calcularTotales, formatRD } from "@/lib/facturas";
import { crearFactura } from "@/app/(app)/facturacion/actions";
import {
  FACTURA_ESTADO_LABEL,
  TIPO_NCF_LABEL,
  type Caso,
  type Cliente,
  type ConceptoLinea,
  type FacturaEstado,
  type TipoNCF,
} from "@/lib/db/types";

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FacturaFormModal({
  open,
  onClose,
  clientes,
  casos,
}: {
  open: boolean;
  onClose: () => void;
  clientes: Pick<Cliente, "id" | "nombre">[];
  casos: Pick<Caso, "id" | "titulo">[];
}) {
  const router = useRouter();
  const [clienteId, setClienteId] = useState("");
  const [casoId, setCasoId] = useState("");
  const [tipoNcf, setTipoNcf] = useState<TipoNCF>("B02");
  const [estado, setEstado] = useState<FacturaEstado>("pendiente");
  const [fecha, setFecha] = useState(hoy());
  const [conceptos, setConceptos] = useState<ConceptoLinea[]>([{ descripcion: "", cantidad: 1, precio: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totales = useMemo(() => calcularTotales(conceptos), [conceptos]);

  function setLinea(i: number, patch: Partial<ConceptoLinea>) {
    setConceptos((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function addLinea() {
    setConceptos((cs) => [...cs, { descripcion: "", cantidad: 1, precio: 0 }]);
  }
  function removeLinea(i: number) {
    setConceptos((cs) => (cs.length === 1 ? cs : cs.filter((_, idx) => idx !== i)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!clienteId) return setError("Selecciona un cliente.");
    if (!conceptos.some((c) => c.descripcion.trim() && c.cantidad > 0)) {
      return setError("Agrega al menos un concepto con descripción y cantidad.");
    }
    setLoading(true);
    const res = await crearFactura({
      cliente_id: clienteId,
      caso_id: casoId || null,
      tipo_ncf: tipoNcf,
      estado,
      fecha,
      conceptos,
    });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Nueva factura"
      title="Emitir factura"
      size="lg"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="tabular font-display text-lg font-semibold text-foreground">{formatRD(totales.total)}</span>
          </div>
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
            <PremiumButton variant="ghost" onClick={onClose} type="button">Cancelar</PremiumButton>
            <PremiumButton variant="gold" type="submit" form="factura-form" loading={loading}>Emitir factura</PremiumButton>
          </div>
        </div>
      }
    >
      <form id="factura-form" onSubmit={onSubmit} className="space-y-4">
        <Field label="Cliente" htmlFor="cliente" required>
          <Select id="cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="" disabled>Selecciona un cliente…</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo de NCF" htmlFor="tipo">
            <Select id="tipo" value={tipoNcf} onChange={(e) => setTipoNcf(e.target.value as TipoNCF)}>
              {Object.entries(TIPO_NCF_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Caso (opcional)" htmlFor="caso">
            <Select id="caso" value={casoId} onChange={(e) => setCasoId(e.target.value)}>
              <option value="">— Sin caso —</option>
              {casos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha" htmlFor="fecha" required>
            <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Field>
          <Field label="Estado" htmlFor="estado">
            <Select id="estado" value={estado} onChange={(e) => setEstado(e.target.value as FacturaEstado)}>
              {Object.entries(FACTURA_ESTADO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
        </div>

        {/* Conceptos */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Conceptos</label>
            <button type="button" onClick={addLinea} className="inline-flex items-center gap-1 text-sm font-medium text-gold transition-opacity hover:opacity-80">
              <Plus className="h-4 w-4" /> Agregar línea
            </button>
          </div>
          <div className="space-y-2">
            {conceptos.map((c, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={c.descripcion}
                  onChange={(e) => setLinea(i, { descripcion: e.target.value })}
                  placeholder="Descripción del servicio"
                  className="flex-1"
                  aria-label={`Descripción línea ${i + 1}`}
                />
                <Input
                  type="number"
                  min={1}
                  value={c.cantidad || ""}
                  onChange={(e) => setLinea(i, { cantidad: Number(e.target.value) })}
                  className="w-16 text-center"
                  aria-label="Cantidad"
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={c.precio || ""}
                  onChange={(e) => setLinea(i, { precio: Number(e.target.value) })}
                  placeholder="Precio"
                  className="w-28 tabular"
                  aria-label="Precio"
                />
                <button
                  type="button"
                  onClick={() => removeLinea(i)}
                  disabled={conceptos.length === 1}
                  aria-label="Quitar línea"
                  className="grid h-11 w-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-[var(--critical-soft)] hover:text-critical disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Desglose */}
        <div className="space-y-1.5 rounded-xl bg-muted/60 p-4 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular text-foreground">{formatRD(totales.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ITBIS (18%)</span><span className="tabular text-foreground">{formatRD(totales.itbis)}</span></div>
          <div className="flex justify-between border-t border-border pt-1.5 font-semibold"><span className="text-foreground">Total</span><span className="tabular text-gold">{formatRD(totales.total)}</span></div>
        </div>

        {error && <p className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">{error}</p>}
      </form>
    </Modal>
  );
}
