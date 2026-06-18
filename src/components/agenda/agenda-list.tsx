"use client";

import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { EmptyState } from "@/components/ui/empty-state";
import { AudienciaCard } from "./audiencia-card";
import { GROUP_LABEL, GROUP_ORDER, audienciaDate, groupKeyFor, type GroupKey } from "@/lib/agenda";
import type { AudienciaConCaso } from "@/lib/db/types";

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
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.key}>
          <div className="mb-3 flex items-center gap-3">
            <h3 className="font-display text-lg font-semibold text-foreground">{group.label}</h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular text-muted-foreground">
              {group.items.length}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Stagger className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {group.items.map((a) => (
              <StaggerItem key={a.id}>
                <AudienciaCard audiencia={a} now={now} onClick={() => onSelect(a)} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ))}
    </div>
  );
}
