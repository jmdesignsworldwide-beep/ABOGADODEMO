"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AudienciaCard } from "./audiencia-card";
import { audienciaDate, formatFechaLarga, gravityFor, type Gravity } from "@/lib/agenda";
import type { AudienciaConCaso } from "@/lib/db/types";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const GRAVITY_RANK: Record<Gravity, number> = { critico: 3, proximo: 2, aldia: 1, pasada: 0 };
const DOT_COLOR: Record<Gravity, string> = {
  critico: "bg-critical",
  proximo: "bg-gold",
  aldia: "bg-navy",
  pasada: "bg-muted-foreground",
};

export function AgendaCalendar({
  audiencias,
  now,
  onSelect,
}: {
  audiencias: AudienciaConCaso[];
  now: Date;
  onSelect: (a: AudienciaConCaso) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(() => dateKey(now));

  // Agrupa audiencias por día (clave YYYY-MM-DD).
  const byDay = useMemo(() => {
    const map = new Map<string, AudienciaConCaso[]>();
    for (const a of audiencias) {
      if (!map.has(a.fecha)) map.set(a.fecha, []);
      map.get(a.fecha)!.push(a);
    }
    return map;
  }, [audiencias]);

  // Construye las celdas del mes (semana inicia lunes).
  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7; // lunes=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [viewMonth]);

  const todayKey = dateKey(now);
  const selectedItems = (byDay.get(selectedKey) ?? []).slice().sort((a, b) =>
    (a.hora ?? "").localeCompare(b.hora ?? ""),
  );

  function dayGravity(items: AudienciaConCaso[]): Gravity {
    return items.reduce<Gravity>((acc, a) => {
      const g = gravityFor(audienciaDate(a), now);
      return GRAVITY_RANK[g] > GRAVITY_RANK[acc] ? g : acc;
    }, "pasada");
  }

  function shiftMonth(delta: number) {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Calendario */}
      <div className="lg:col-span-3">
        <div className="rounded-2xl glass p-4 shadow-layered sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {MESES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </h3>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => { setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedKey(todayKey); }} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                Hoy
              </button>
              <button type="button" aria-label="Mes anterior" onClick={() => shiftMonth(-1)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Mes siguiente" onClick={() => shiftMonth(1)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w, i) => (
              <div key={i} className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {w}
              </div>
            ))}
            {cells.map((d, i) => {
              if (!d) return <div key={i} aria-hidden />;
              const key = dateKey(d);
              const items = byDay.get(key) ?? [];
              const isToday = key === todayKey;
              const isSelected = key === selectedKey;
              const grav = items.length ? dayGravity(items) : null;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm tabular transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    isSelected ? "bg-navy text-navy-foreground" : "hover:bg-muted",
                    !isSelected && isToday && "ring-1 ring-[var(--gold)]/60",
                    !isSelected && "text-foreground",
                  )}
                >
                  <span className={cn(isToday && !isSelected && "font-semibold text-gold")}>{d.getDate()}</span>
                  {grav && (
                    <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full", isSelected ? "bg-gold" : DOT_COLOR[grav])} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-critical" /> Crítico (≤48h)</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-gold" /> Esta semana</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-navy" /> Próximas</span>
          </div>
        </div>
      </div>

      {/* Día seleccionado */}
      <div className="lg:col-span-2">
        <h3 className="mb-3 font-display text-lg font-semibold text-foreground">
          {selectedItems.length > 0 ? formatFechaLarga(selectedItems[0]) : formatFechaLarga({ fecha: selectedKey, hora: null })}
        </h3>
        {selectedItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Sin audiencias ni citas este día.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedItems.map((a) => (
              <AudienciaCard key={a.id} audiencia={a} now={now} onClick={() => onSelect(a)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
