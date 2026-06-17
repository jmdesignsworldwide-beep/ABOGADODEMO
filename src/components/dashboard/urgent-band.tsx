"use client";

import { Flame } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { UrgentCard } from "./urgent-card";
import { gravityFor, urgentItems } from "@/lib/data/dashboard";

/**
 * Banda "Lo urgente" — lo más importante, va primero. Audiencias y plazos
 * ordenados por urgencia (menos horas primero). Grid responsive que se apila
 * limpio en móvil 390px.
 */
export function UrgentBand() {
  const items = [...urgentItems].sort((a, b) => a.hours - b.hours);
  const criticos = items.filter((i) => gravityFor(i.hours) === "critico").length;

  return (
    <section id="urgente" className="scroll-mt-20 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
          <Flame className="h-5 w-5 text-critical" strokeWidth={2} />
          Lo urgente
        </h3>
        {criticos > 0 && (
          <span className="rounded-full bg-[var(--critical-soft)] px-2.5 py-1 text-xs font-semibold text-critical">
            {criticos} {criticos === 1 ? "crítico" : "críticos"}
          </span>
        )}
      </div>

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <StaggerItem key={item.id} className="h-full">
            <UrgentCard item={item} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
