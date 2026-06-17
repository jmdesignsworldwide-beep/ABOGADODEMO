"use client";

import {
  Briefcase,
  CalendarClock,
  Scale,
  Wallet,
} from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { KpiCard } from "@/components/ui/kpi-card";
import { MagneticCard } from "@/components/ui/magnetic-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PremiumButton } from "@/components/ui/premium-button";
import { SkeletonCard } from "@/components/ui/skeleton";

/**
 * Panel (vitrina de la Tanda 1): muestra el sistema de diseño y los primitivos
 * en funcionamiento con datos de ejemplo. Aún no hay módulos: esto es la base
 * que heredarán Clientes, Casos, Audiencias, etc.
 */
export default function PanelPage() {
  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <header className="space-y-1.5">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
          JM &amp; Asociados | Abogados
        </p>
        <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
          Buen día, Lic. Martínez
        </h2>
        <p className="max-w-prose text-muted-foreground">
          Este es el panel base del sistema. Los indicadores y tarjetas usan los
          primitivos animados que reutilizaremos en cada módulo.
        </p>
      </header>

      {/* KPIs */}
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <KpiCard label="Casos activos" value={42} icon={Scale} trend={8} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Clientes" value={186} icon={Briefcase} trend={5} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Audiencias del mes"
            value={17}
            icon={CalendarClock}
            trend={-3}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Facturado (RD$)"
            value={2480000}
            prefix="RD$ "
            icon={Wallet}
            trend={12}
          />
        </StaggerItem>
      </Stagger>

      {/* Progreso + estados */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MagneticCard className="p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Avance de casos prioritarios
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Barras que se llenan animándose al aparecer.
          </p>
          <div className="mt-6 space-y-5">
            <ProgressBar label="Sánchez vs. Inmobiliaria del Este" value={82} />
            <ProgressBar label="Sucesión Familia Reyes" value={64} />
            <ProgressBar label="Recurso de amparo — Cooperativa" value={45} />
            <ProgressBar label="Constitución Grupo Caribe S.R.L." value={28} />
          </div>
        </MagneticCard>

        <MagneticCard glow className="flex flex-col p-6">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Acciones rápidas
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Botones premium con micro-interacción.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <PremiumButton variant="gold" fullWidth>
              Nuevo caso
            </PremiumButton>
            <PremiumButton variant="primary" fullWidth>
              Registrar cliente
            </PremiumButton>
            <PremiumButton variant="outline" fullWidth>
              Agendar audiencia
            </PremiumButton>
            <PremiumButton variant="ghost" fullWidth>
              Ver reportes
            </PremiumButton>
          </div>
        </MagneticCard>
      </div>

      {/* Estado de carga (skeleton elegante) */}
      <section className="space-y-3">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Estado de carga
        </h3>
        <p className="text-sm text-muted-foreground">
          Así se ve el skeleton mientras llegan datos reales de Supabase.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    </div>
  );
}
