"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { MagneticCard } from "./magnetic-card";
import { CountUp } from "./count-up";
import { cn } from "@/lib/utils";

/**
 * KpiCard — tarjeta de indicador con número que cuenta hacia arriba.
 * Combina MagneticCard + CountUp + icono + variación (trend).
 * Reutilizable en dashboards de cualquier módulo.
 */
export function KpiCard({
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: LucideIcon;
  /** Variación porcentual; positivo = sube (verde), negativo = baja. */
  trend?: number;
  className?: string;
}) {
  const up = (trend ?? 0) >= 0;

  return (
    <MagneticCard glow className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold">
            <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
        )}
      </div>

      <div className="mt-3 font-display text-3xl font-semibold leading-none text-foreground sm:text-4xl">
        <CountUp
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
      </div>

      {typeof trend === "number" && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium tabular",
              up
                ? "bg-emerald-500/12 text-emerald-500"
                : "bg-rose-500/12 text-rose-500",
            )}
          >
            {up ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </span>
          <span className="text-muted-foreground">vs. mes anterior</span>
        </div>
      )}
    </MagneticCard>
  );
}
