"use client";

import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { AudienciaCard } from "./audiencia-card";
import { GROUP_LABEL, GROUP_ORDER, audienciaDate, groupKeyFor, type GroupKey } from "@/lib/agenda";
import type { AudienciaConCaso } from "@/lib/db/types";

/* Acento por sección — comunica prioridad de un vistazo (mismo lenguaje de
   gravedad del Panel): Hoy = ámbar crítico, semana = dorado, próximas =
   marino tranquilo, pasadas = gris atenuado. */
const SECTION: Record<GroupKey, { bar: string; badge: string; dim?: boolean }> = {
  hoy: {
    bar: "bg-critical",
    badge: "bg-[var(--critical-soft)] text-critical ring-1 ring-[color-mix(in_srgb,var(--critical)_30%,transparent)]",
  },
  manana: {
    bar: "bg-gold-bright",
    badge: "bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold ring-1 ring-[color-mix(in_srgb,var(--gold)_28%,transparent)]",
  },
  semana: {
    bar: "bg-gold",
    badge: "bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold ring-1 ring-[color-mix(in_srgb,var(--gold)_28%,transparent)]",
  },
  proximas: {
    bar: "bg-navy",
    badge: "bg-[color-mix(in_srgb,var(--navy)_12%,transparent)] text-navy ring-1 ring-[color-mix(in_srgb,var(--navy)_26%,transparent)]",
  },
  pasadas: {
    bar: "bg-muted-foreground/40",
    badge: "bg-muted text-muted-foreground ring-1 ring-border",
    dim: true,
  },
};

export function AgendaList({
  audiencias,
  now,
  onSelect,
}: {
  audiencias: AudienciaConCaso[];
  now: Date;
  onSelect: (a: AudienciaConCaso) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<GroupKey, AudienciaConCaso[]>();
    for (const a of audiencias) {
      const k = groupKeyFor(audienciaDate(a), now);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(a);
    }
    return GROUP_ORDER.map((k) => ({ key: k, label: GROUP_LABEL[k], items: map.get(k) ?? [] })).filter(
      (g) => g.items.length > 0,
    );
  }, [audiencias, now]);

  if (audiencias.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Agenda despejada"
        description="No hay audiencias ni citas registradas. Agenda la primera."
      />
    );
  }

  return (
    <div className="space-y-10">
      {groups.map((group) => {
        const s = SECTION[group.key];
        const isHoy = group.key === "hoy";
        return (
          <section key={group.key} className={cn(s.dim && "opacity-65")}>
            <div className="mb-4 flex items-center gap-3">
              <span className={cn("h-7 w-1.5 shrink-0 rounded-full", s.bar)} />
              <h3
                className={cn(
                  "font-display font-semibold tracking-tight",
                  isHoy ? "text-2xl" : "text-xl",
                  group.key === "pasadas" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {group.label}
              </h3>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold tabular", s.badge)}>
                {group.items.length}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>
            <Stagger className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {group.items.map((a) => (
                <StaggerItem key={a.id}>
                  <AudienciaCard audiencia={a} now={now} onClick={() => onSelect(a)} />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        );
      })}
    </div>
  );
}
