"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CalendarClock, Scale, Wallet } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { KpiCard } from "@/components/ui/kpi-card";
import { MagneticCard } from "@/components/ui/magnetic-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PremiumButton } from "@/components/ui/premium-button";
import { AlertStrip } from "./alert-strip";
import { UrgentBand } from "./urgent-band";
import { AudienciaDetalleModal } from "@/components/agenda/audiencia-detalle-modal";
import { AudienciaFormModal } from "@/components/agenda/audiencia-form-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteAudiencia } from "@/app/(app)/agenda/actions";
import { audienciaDate, dayDiff, gravityFor } from "@/lib/agenda";
import type { DashboardData } from "@/lib/db/dashboard";
import type { AudienciaConCaso, Caso } from "@/lib/db/types";

export function PanelClient({
  kpis,
  urgentes,
  prioritarios,
  casos,
  nowISO,
}: DashboardData & { casos: Pick<Caso, "id" | "titulo">[]; nowISO: string }) {
  const router = useRouter();
  const now = useMemo(() => new Date(nowISO), [nowISO]);
  const [sel, setSel] = useState<AudienciaConCaso | null>(null);
  const [editing, setEditing] = useState<AudienciaConCaso | null>(null);
  const [deleting, setDeleting] = useState<AudienciaConCaso | null>(null);

  const { semana, h48 } = useMemo(() => {
    let s = 0, h = 0;
    for (const a of urgentes) {
      const d = audienciaDate(a);
      const dd = dayDiff(d, now);
      if (dd >= 0 && dd <= 7) s++;
      if (gravityFor(d, now) === "critico") h++;
    }
    return { semana: s, h48: h };
  }, [urgentes, now]);

  return (
    <div className="space-y-8">
      {/* 1 · Saludo + alerta viva */}
      <Stagger className="space-y-4" stagger={0.08}>
        <StaggerItem>
          <header className="space-y-1.5">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              JM &amp; Asociados | Abogados
            </p>
            <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
              Buen día, Lic. Martínez
            </h2>
          </header>
        </StaggerItem>
        <StaggerItem>
          <AlertStrip semana={semana} h48={h48} />
        </StaggerItem>
      </Stagger>

      {/* 2 · Lo urgente (real) */}
      <UrgentBand audiencias={urgentes} now={now} onSelect={setSel} />

      {/* 3 · KPIs (reales, con count-up) */}
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <KpiCard label="Casos activos" value={kpis.casosActivos} icon={Scale} onClick={() => router.push("/casos")} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Clientes" value={kpis.clientes} icon={Briefcase} onClick={() => router.push("/clientes")} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Audiencias del mes" value={kpis.audienciasMes} icon={CalendarClock} onClick={() => router.push("/agenda")} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Facturado (RD$)" value={kpis.facturadoMes} prefix="RD$ " icon={Wallet} onClick={() => router.push("/facturacion")} />
        </StaggerItem>
      </Stagger>

      {/* 4 · Avance + Acciones rápidas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MagneticCard className="p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-foreground">Avance de casos prioritarios</h3>
          <p className="mt-1 text-sm text-muted-foreground">Toca un caso para ver su detalle.</p>
          <div className="mt-6 space-y-4">
            {prioritarios.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay casos activos.</p>
            ) : (
              prioritarios.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => router.push(`/casos/${c.id}`)}
                  className="block w-full rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <ProgressBar label={c.titulo} value={c.avance} />
                </button>
              ))
            )}
          </div>
        </MagneticCard>

        <MagneticCard glow className="flex flex-col p-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Acciones rápidas</h3>
          <p className="mt-1 text-sm text-muted-foreground">Atajos del día a día.</p>
          <div className="mt-6 flex flex-col gap-3">
            <PremiumButton variant="gold" fullWidth onClick={() => router.push("/casos?nuevo=1")}>Nuevo caso</PremiumButton>
            <PremiumButton variant="gold" fullWidth onClick={() => router.push("/clientes?nuevo=1")}>Registrar cliente</PremiumButton>
            <PremiumButton variant="outline" fullWidth onClick={() => router.push("/agenda?nuevo=1")}>Agendar audiencia</PremiumButton>
            <PremiumButton variant="ghost" fullWidth onClick={() => router.push("/facturacion")}>Ver facturación</PremiumButton>
          </div>
        </MagneticCard>
      </div>

      {/* Detalle real de la audiencia urgente */}
      <AudienciaDetalleModal
        audiencia={sel}
        now={now}
        open={Boolean(sel)}
        onClose={() => setSel(null)}
        onEdit={() => { setEditing(sel); setSel(null); }}
        onDelete={() => { setDeleting(sel); setSel(null); }}
      />
      {editing && <AudienciaFormModal open onClose={() => setEditing(null)} casos={casos} audiencia={editing} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Eliminar de la agenda"
        description={`Se eliminará “${deleting?.titulo ?? ""}”. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          if (!deleting) return { ok: false, error: "Sin selección" };
          const res = await deleteAudiencia(deleting.id);
          if (res.ok) router.refresh();
          return res;
        }}
      />
    </div>
  );
}
