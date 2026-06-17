"use client";

import { Briefcase, CalendarClock, Scale, Wallet, type LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { KpiCard } from "@/components/ui/kpi-card";
import { MagneticCard } from "@/components/ui/magnetic-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PremiumButton } from "@/components/ui/premium-button";
import { useDetail } from "@/components/ui/detail-modal";
import { AlertStrip } from "@/components/dashboard/alert-strip";
import { UrgentBand } from "@/components/dashboard/urgent-band";
import { kpis, priorityCases } from "@/lib/data/dashboard";

const KPI_ICONS: Record<string, LucideIcon> = {
  casos: Scale,
  clientes: Briefcase,
  audiencias: CalendarClock,
  facturado: Wallet,
};

/**
 * Dashboard (Panel) — primera impresión del bufete. Orden por urgencia:
 * 1) Saludo + franja de alerta viva
 * 2) Lo urgente (audiencias/plazos con countdown y gravedad)
 * 3) KPIs con count-up
 * 4) Avance de casos + Acciones rápidas
 * Patrón "nada es un clic muerto": todo abre un detalle.
 */
export default function PanelPage() {
  const { open } = useDetail();

  return (
    <div className="space-y-8">
      {/* 1 · Saludo + alerta viva (cascada) */}
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
          <AlertStrip />
        </StaggerItem>
      </Stagger>

      {/* 2 · Lo urgente (primero, lo más importante) */}
      <UrgentBand />

      {/* 3 · KPIs */}
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <StaggerItem key={k.id}>
            <KpiCard
              label={k.label}
              value={k.value}
              prefix={k.prefix}
              icon={KPI_ICONS[k.id]}
              trend={k.trend}
              onClick={() =>
                open({
                  kind: "kpi",
                  eyebrow: "Indicador",
                  title: k.label,
                  subtitle: k.detalle,
                  accent: "gold",
                  cta: "Ver reporte",
                  meta: [
                    { label: "Valor", value: `${k.prefix ?? ""}${k.value.toLocaleString("es-DO")}` },
                    { label: "Variación", value: `${k.trend > 0 ? "+" : ""}${k.trend}% vs. mes anterior` },
                  ],
                })
              }
            />
          </StaggerItem>
        ))}
      </Stagger>

      {/* 4 · Avance + Acciones rápidas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MagneticCard className="p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Avance de casos prioritarios
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Toca un caso para ver su detalle.
          </p>
          <div className="mt-6 space-y-4">
            {priorityCases.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  open({
                    kind: "caso",
                    eyebrow: "Caso prioritario",
                    title: c.caso,
                    subtitle: `Etapa actual: ${c.etapa}`,
                    accent: "gold",
                    cta: "Abrir caso",
                    meta: [
                      { label: "Etapa", value: c.etapa },
                      { label: "Avance", value: `${c.progreso}%` },
                    ],
                  })
                }
                className="block w-full rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <ProgressBar label={c.caso} value={c.progreso} />
              </button>
            ))}
          </div>
        </MagneticCard>

        <MagneticCard glow className="flex flex-col p-6">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Acciones rápidas
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Atajos del día a día.</p>
          <div className="mt-6 flex flex-col gap-3">
            <PremiumButton
              variant="gold"
              fullWidth
              onClick={() => open({ eyebrow: "Nuevo", title: "Nuevo caso", subtitle: "Registra un expediente nuevo.", cta: "Continuar" })}
            >
              Nuevo caso
            </PremiumButton>
            <PremiumButton
              variant="primary"
              fullWidth
              onClick={() => open({ eyebrow: "Nuevo", title: "Registrar cliente", subtitle: "Añade un cliente al bufete.", accent: "navy", cta: "Continuar" })}
            >
              Registrar cliente
            </PremiumButton>
            <PremiumButton
              variant="outline"
              fullWidth
              onClick={() => open({ eyebrow: "Agenda", title: "Agendar audiencia", subtitle: "Programa una nueva audiencia.", cta: "Continuar" })}
            >
              Agendar audiencia
            </PremiumButton>
            <PremiumButton
              variant="ghost"
              fullWidth
              onClick={() => open({ eyebrow: "Reportes", title: "Ver reportes", subtitle: "Métricas y reportes del bufete.", cta: "Continuar" })}
            >
              Ver reportes
            </PremiumButton>
          </div>
        </MagneticCard>
      </div>
    </div>
  );
}
