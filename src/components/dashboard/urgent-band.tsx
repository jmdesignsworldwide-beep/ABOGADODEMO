"use client";

import { Flame } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { UrgentCard } from "./urgent-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarClock } from "lucide-react";
import { audienciaDate, gravityFor } from "@/lib/agenda";
import type { AudienciaConCaso } from "@/lib/db/types";

/**
 * Banda "Lo urgente" — audiencias/citas REALES próximas, ordenadas por fecha,
 * con gravedad por color calculada según cuánto falta de verdad.
 */
export function UrgentBand({
  audiencias,
  now,
  onSelect,
}: {
  audiencias: AudienciaConCaso[];
  now: Date;
  onSelect: (a: AudienciaConCaso) => void;
}) {
  const items = [...audiencias].sort(
    (a, b) => audienciaDate(a).getTime() - audienciaDate(b).getTime(),
  );
  const criticos = items.filter((i) => gravityFor(audienciaDate(i), now) === "critico").length;

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

      {items.length === 0 ? (
        <EmptyState icon={CalendarClock} title="Nada urgente" description="No hay audiencias ni citas próximas en la agenda." />
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((a) => (
            <StaggerItem key={a.id} className="h-full">
              <UrgentCard audiencia={a} now={now} onClick={() => onSelect(a)} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
