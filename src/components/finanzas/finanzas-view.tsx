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
import { IngresosEgresosChart, EgresosCategoriaChart, HonorariosChart } from "./charts";
import { EgresoFormModal } from "./egreso-form-modal";
import { EgresoDetalleModal } from "./egreso-detalle-modal";
import { DesgloseModal, type DesgloseRow } from "./desglose-modal";
import { eliminarEgreso } from "@/app/(app)/finanzas/actions";
import { formatRD } from "@/lib/facturas";
import { CATEGORIA_EGRESO_LABEL, type CategoriaEgreso, type Egreso } from "@/lib/db/types";
import type { FacturaLite, FinancieroData } from "@/lib/db/financiero";

type Desglose = {
  title: string;
  eyebrow?: string;
  accent?: "gold" | "navy" | "critical";
  total?: number;
  rows: DesgloseRow[];
  emptyText?: string;
};

const mk = (iso: string) => iso.slice(0, 7);
const facturaRows = (fs: FacturaLite[]): DesgloseRow[] =>
  fs.map((f) => ({ kind: "factura", id: f.id, titulo: f.cliente, sub: `${f.numero} · ${new Date(`${f.fecha}T00:00:00`).toLocaleDateString("es-DO", { day: "2-digit", month: "short" })}`, monto: f.total }));
const egresoRows = (es: Egreso[]): DesgloseRow[] => es.map((e) => ({ kind: "egreso", egreso: e }));

export function FinanzasView({ data }: { data: FinancieroData }) {
  const router = useRouter();
  const { kpis, serie, porCategoria, honorarios, movimientos, mesActual, facturasPagadas, facturasPendientes, egresos } = data;

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Egreso | null>(null);
  const [selected, setSelected] = useState<Egreso | null>(null);
  const [deleting, setDeleting] = useState<Egreso | null>(null);
  const [desglose, setDesglose] = useState<Desglose | null>(null);

  const abrirEgreso = (e: Egreso) => { setDesglose(null); setSelected(e); };

  // Subconjuntos del mes actual
  const pagadasMes = facturasPagadas.filter((f) => mk(f.fecha) === mesActual);
  const egresosMesArr = egresos.filter((e) => mk(e.fecha) === mesActual);

  function desgloseMes(key: string, mes: string) {
    const ing = facturasPagadas.filter((f) => mk(f.fecha) === key);
    const egr = egresos.filter((e) => mk(e.fecha) === key);
    setDesglose({
      title: `Movimientos · ${mes}`,
      eyebrow: "Desglose del mes",
      accent: "navy",
      rows: [...facturaRows(ing), ...egresoRows(egr)],
      emptyText: "No hubo movimientos este mes.",
    });
  }

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
            onClick={() => setDesglose({ title: "Ingresos del mes", eyebrow: "Facturas cobradas", accent: "gold", total: kpis.ingresosMes, rows: facturaRows(pagadasMes), emptyText: "No hay facturas cobradas este mes." })} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Egresos del mes" value={kpis.egresosMes} prefix="RD$ " icon={TrendingDown}
            onClick={() => setDesglose({ title: "Egresos del mes", eyebrow: "Gastos del bufete", accent: "critical", total: kpis.egresosMes, rows: egresoRows(egresosMesArr), emptyText: "No hay egresos este mes." })} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Balance del mes" value={kpis.balanceMes} prefix="RD$ " icon={Wallet}
            onClick={() => setDesglose({ title: "Balance del mes", eyebrow: "Ingresos y egresos", accent: kpis.balanceMes >= 0 ? "gold" : "critical", rows: [...facturaRows(pagadasMes), ...egresoRows(egresosMesArr)], emptyText: "Sin movimientos este mes." })} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Honorarios pendientes" value={kpis.honorariosPendientes} prefix="RD$ " icon={Scale}
            onClick={() => setDesglose({ title: "Honorarios pendientes", eyebrow: "Facturas sin cobrar", accent: "gold", total: kpis.honorariosPendientes, rows: facturaRows(facturasPendientes), emptyText: "No hay facturas pendientes." })} />
        </StaggerItem>
      </Stagger>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl glass p-5 shadow-layered lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-foreground">Ingresos vs. Egresos</h3>
          <p className="mt-1 text-sm text-muted-foreground">Últimos 6 meses · toca una barra para el desglose.</p>
          <div className="mt-4"><IngresosEgresosChart data={serie} onMonthClick={desgloseMes} /></div>
        </div>
        <div className="rounded-2xl glass p-5 shadow-layered">
          <h3 className="font-display text-lg font-semibold text-foreground">Honorarios</h3>
          <p className="mt-1 text-sm text-muted-foreground">Toca una parte para ver sus facturas.</p>
          <div className="mt-4">
            <HonorariosChart
              cobrado={honorarios.cobrado}
              pendiente={honorarios.pendiente}
              onSegmentClick={(seg) =>
                seg === "cobrado"
                  ? setDesglose({ title: "Honorarios cobrados", eyebrow: "Facturas pagadas", accent: "gold", total: honorarios.cobrado, rows: facturaRows(facturasPagadas), emptyText: "Sin facturas cobradas." })
                  : setDesglose({ title: "Honorarios pendientes", eyebrow: "Facturas sin cobrar", accent: "gold", total: honorarios.pendiente, rows: facturaRows(facturasPendientes), emptyText: "Sin facturas pendientes." })
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl glass p-5 shadow-layered">
          <h3 className="font-display text-lg font-semibold text-foreground">Egresos por categoría</h3>
          <p className="mt-1 text-sm text-muted-foreground">Toca una categoría para ver sus egresos.</p>
          <div className="mt-4">
            <EgresosCategoriaChart
              data={porCategoria}
              onCategoriaClick={(cat: CategoriaEgreso) =>
                setDesglose({
                  title: CATEGORIA_EGRESO_LABEL[cat],
                  eyebrow: "Egresos por categoría",
                  accent: "critical",
                  total: porCategoria.find((c) => c.categoria === cat)?.monto,
                  rows: egresoRows(egresos.filter((e) => e.categoria === cat)),
                  emptyText: "Sin egresos en esta categoría.",
                })
              }
            />
          </div>
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
                    <span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular text-emerald-500">+{formatRD(m.monto)}</span>
                  </Link>
                ) : (
                  <button key={m.id} type="button" onClick={() => setSelected(m.egreso)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--critical-soft)] text-critical"><ArrowUpRight className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{m.egreso.concepto}</p>
                      <p className="truncate text-xs text-muted-foreground">{CATEGORIA_EGRESO_LABEL[m.egreso.categoria]} · {fecha(m.egreso.fecha)}</p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular text-critical">−{formatRD(Number(m.egreso.monto))}</span>
                  </button>
                ),
              )
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <DesgloseModal
        open={Boolean(desglose)}
        onClose={() => setDesglose(null)}
        title={desglose?.title ?? ""}
        eyebrow={desglose?.eyebrow}
        accent={desglose?.accent}
        total={desglose?.total}
        rows={desglose?.rows ?? []}
        onEgreso={abrirEgreso}
        emptyText={desglose?.emptyText}
      />
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
