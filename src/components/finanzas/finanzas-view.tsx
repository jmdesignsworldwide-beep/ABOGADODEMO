"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Plus, Scale, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumButton } from "@/components/ui/premium-button";
import { KpiCard } from "@/components/ui/kpi-card";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDetail } from "@/components/ui/detail-modal";
import { IngresosEgresosChart, EgresosCategoriaChart, HonorariosChart } from "./charts";
import { EgresoFormModal } from "./egreso-form-modal";
import { EgresoDetalleModal } from "./egreso-detalle-modal";
import { eliminarEgreso } from "@/app/(app)/finanzas/actions";
import { formatRD } from "@/lib/facturas";
import { CATEGORIA_EGRESO_LABEL, type Egreso } from "@/lib/db/types";
import type { FinancieroData } from "@/lib/db/financiero";

export function FinanzasView({ data }: { data: FinancieroData }) {
  const router = useRouter();
  const { open } = useDetail();
  const { kpis, serie, porCategoria, honorarios, movimientos } = data;

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Egreso | null>(null);
  const [selected, setSelected] = useState<Egreso | null>(null);
  const [deleting, setDeleting] = useState<Egreso | null>(null);

  const topCats = porCategoria.slice(0, 4).map((c) => ({ label: CATEGORIA_EGRESO_LABEL[c.categoria], value: formatRD(c.monto) }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Control Financiero"
        subtitle="La salud de tu bufete de un vistazo"
        action={<PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>Nuevo egreso</PremiumButton>}
      />

      {/* KPIs */}
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <KpiCard label="Ingresos del mes" value={kpis.ingresosMes} prefix="RD$ " icon={TrendingUp}
            onClick={() => open({ eyebrow: "Ingresos", title: "Ingresos del mes", subtitle: "Facturas cobradas este mes.", accent: "gold", cta: "Ver facturación", meta: [{ label: "Total cobrado", value: formatRD(kpis.ingresosMes) }, { label: "Honorarios cobrados (total)", value: formatRD(honorarios.cobrado) }] })} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Egresos del mes" value={kpis.egresosMes} prefix="RD$ " icon={TrendingDown}
            onClick={() => open({ eyebrow: "Egresos", title: "Egresos del mes", subtitle: "Principales categorías de gasto.", accent: "critical", cta: "Entendido", meta: topCats })} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Balance del mes" value={kpis.balanceMes} prefix="RD$ " icon={Wallet}
            onClick={() => open({ eyebrow: "Balance", title: "Balance del mes", subtitle: "Ingresos menos egresos.", accent: kpis.balanceMes >= 0 ? "gold" : "critical", cta: "Entendido", meta: [{ label: "Ingresos", value: formatRD(kpis.ingresosMes) }, { label: "Egresos", value: formatRD(kpis.egresosMes) }, { label: "Balance", value: formatRD(kpis.balanceMes) }] })} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Honorarios pendientes" value={kpis.honorariosPendientes} prefix="RD$ " icon={Scale}
            onClick={() => open({ eyebrow: "Honorarios", title: "Honorarios pendientes", subtitle: "Facturas emitidas sin cobrar.", accent: "gold", cta: "Ver facturación", meta: [{ label: "Pendiente de cobro", value: formatRD(honorarios.pendiente) }, { label: "Cobrado", value: formatRD(honorarios.cobrado) }] })} />
        </StaggerItem>
      </Stagger>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl glass p-5 shadow-layered lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-foreground">Ingresos vs. Egresos</h3>
          <p className="mt-1 text-sm text-muted-foreground">Últimos 6 meses (RD$).</p>
          <div className="mt-4"><IngresosEgresosChart data={serie} /></div>
        </div>
        <div className="rounded-2xl glass p-5 shadow-layered">
          <h3 className="font-display text-lg font-semibold text-foreground">Honorarios</h3>
          <p className="mt-1 text-sm text-muted-foreground">Cobrados vs. pendientes.</p>
          <div className="mt-4"><HonorariosChart cobrado={honorarios.cobrado} pendiente={honorarios.pendiente} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl glass p-5 shadow-layered">
          <h3 className="font-display text-lg font-semibold text-foreground">Egresos por categoría</h3>
          <p className="mt-1 text-sm text-muted-foreground">Distribución del gasto del bufete.</p>
          <div className="mt-4"><EgresosCategoriaChart data={porCategoria} /></div>
        </div>

        {/* Movimientos recientes */}
        <div className="rounded-2xl glass p-5 shadow-layered">
          <h3 className="font-display text-lg font-semibold text-foreground">Movimientos recientes</h3>
          <p className="mt-1 text-sm text-muted-foreground">Ingresos (facturas) y egresos.</p>
          <div className="mt-4 space-y-2">
            {movimientos.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Sin movimientos.</p>
            ) : (
              movimientos.map((m) =>
                m.tipo === "ingreso" ? (
                  <Link key={m.id} href={`/facturacion/${m.facturaId}`} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-500"><ArrowDownLeft className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{m.etiqueta}</p>
                      <p className="truncate text-xs tabular text-muted-foreground">{m.ref} · {fecha(m.fecha)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular text-emerald-500">+{formatRD(m.monto)}</span>
                  </Link>
                ) : (
                  <button key={m.id} type="button" onClick={() => setSelected(m.egreso)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--critical-soft)] text-critical"><ArrowUpRight className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{m.egreso.concepto}</p>
                      <p className="truncate text-xs text-muted-foreground">{CATEGORIA_EGRESO_LABEL[m.egreso.categoria]} · {fecha(m.egreso.fecha)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular text-critical">−{formatRD(Number(m.egreso.monto))}</span>
                  </button>
                ),
              )
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <EgresoFormModal open={creating} onClose={() => setCreating(false)} />
      {editing && <EgresoFormModal open onClose={() => setEditing(null)} egreso={editing} />}
      <EgresoDetalleModal
        egreso={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onEdit={() => { setEditing(selected); setSelected(null); }}
        onDelete={() => { setDeleting(selected); setSelected(null); }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Eliminar egreso"
        description={`Se eliminará “${deleting?.concepto ?? ""}”. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          if (!deleting) return { ok: false, error: "Sin selección" };
          const res = await eliminarEgreso(deleting.id);
          if (res.ok) router.refresh();
          return res;
        }}
      />
    </div>
  );
}

function fecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-DO", { day: "2-digit", month: "short" });
}
