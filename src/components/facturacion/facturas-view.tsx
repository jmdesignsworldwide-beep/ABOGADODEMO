"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Receipt, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumButton } from "@/components/ui/premium-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { FacturaFormModal } from "./factura-form-modal";
import { formatRD } from "@/lib/facturas";
import {
  FACTURA_ESTADO_LABEL,
  FACTURA_ESTADO_STYLE,
  type Caso,
  type Cliente,
  type FacturaConVinculos,
  type FacturaEstado,
} from "@/lib/db/types";

export function FacturasView({
  facturas,
  clientes,
  casos,
}: {
  facturas: FacturaConVinculos[];
  clientes: Pick<Cliente, "id" | "nombre">[];
  casos: Pick<Caso, "id" | "titulo">[];
}) {
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState<FacturaEstado | "todos">("todos");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return facturas.filter((f) => {
      if (estado !== "todos" && f.estado !== estado) return false;
      if (!q) return true;
      return [f.numero, f.cliente?.nombre].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [facturas, query, estado]);

  const totales = useMemo(() => {
    let facturado = 0, pendiente = 0;
    for (const f of facturas) {
      if (f.estado === "anulada") continue;
      facturado += Number(f.total);
      if (f.estado === "pendiente") pendiente += Number(f.total);
    }
    return { facturado, pendiente };
  }, [facturas]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facturación"
        subtitle={`${facturas.length} ${facturas.length === 1 ? "factura" : "facturas"} emitidas`}
        action={
          <PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
            Nueva factura
          </PremiumButton>
        }
      />

      {/* Resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl glass p-5 shadow-layered">
          <p className="text-sm text-muted-foreground">Total facturado (sin anuladas)</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular text-foreground">{formatRD(totales.facturado)}</p>
        </div>
        <div className="rounded-2xl glass p-5 shadow-layered">
          <p className="text-sm text-muted-foreground">Pendiente de cobro</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular text-gold">{formatRD(totales.pendiente)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar NCF o cliente…" className="pl-11" aria-label="Buscar facturas" />
        </div>
        <Select value={estado} onChange={(e) => setEstado(e.target.value as FacturaEstado | "todos")} aria-label="Filtrar por estado" className="sm:w-44">
          <option value="todos">Todos los estados</option>
          {Object.entries(FACTURA_ESTADO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
      </div>

      {facturas.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aún no hay facturas"
          description="Emite tu primera factura y vincúlala a un cliente."
          action={<PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>Nueva factura</PremiumButton>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description="Ajusta la búsqueda o el filtro." />
      ) : (
        <Stagger className="space-y-3">
          {filtered.map((f) => (
            <StaggerItem key={f.id}>
              <Link
                href={`/facturacion/${f.id}`}
                className="flex items-center gap-4 rounded-2xl glass p-4 shadow-layered transition-shadow duration-300 hover:glow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold">
                  <Receipt className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-display text-base font-semibold tabular text-foreground">{f.numero}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${FACTURA_ESTADO_STYLE[f.estado]}`}>
                      {FACTURA_ESTADO_LABEL[f.estado]}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{f.cliente?.nombre ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className="tabular font-display text-lg font-semibold text-foreground">{formatRD(Number(f.total))}</p>
                  <p className="text-xs text-muted-foreground">{new Date(`${f.fecha}T00:00:00`).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <FacturaFormModal open={creating} onClose={() => setCreating(false)} clientes={clientes} casos={casos} />
    </div>
  );
}
