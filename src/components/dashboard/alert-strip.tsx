"use client";

import { CalendarClock, ChevronRight, TriangleAlert } from "lucide-react";
import { alertSummary } from "@/lib/data/dashboard";

/**
 * Franja de alerta viva bajo el saludo. Resume lo urgente con cifras
 * derivadas de los datos (siempre veraces). Clic → baja a "Lo urgente".
 */
export function AlertStrip() {
  const { plazosSemana, audiencias48 } = alertSummary();
  const hayCriticos = audiencias48 > 0 || plazosSemana > 0;

  return (
    <a
      href="#urgente"
      className="group flex items-center gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--critical)_40%,transparent)] bg-[var(--critical-soft)] px-4 py-3 transition-colors hover:bg-[color-mix(in_srgb,var(--critical)_18%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--critical)_22%,transparent)] text-critical">
        {hayCriticos ? (
          <TriangleAlert className="h-5 w-5" strokeWidth={2} />
        ) : (
          <CalendarClock className="h-5 w-5" strokeWidth={2} />
        )}
      </span>

      <p className="min-w-0 flex-1 text-sm font-medium text-foreground sm:text-[15px]">
        <span className="tabular font-semibold text-critical">{plazosSemana} plazos</span>{" "}
        vencen esta semana
        <span className="mx-2 text-muted-foreground">·</span>
        <span className="tabular font-semibold text-critical">{audiencias48} audiencias</span>{" "}
        en 48h
      </p>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}
