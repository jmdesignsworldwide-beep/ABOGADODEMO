"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Clock, Gavel, MapPin, Timer, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { audienciaDate, countdownFor, formatHora, gravityFor } from "@/lib/agenda";
import type { AudienciaConCaso } from "@/lib/db/types";

const GRAVITY = {
  critico: { border: "border-[color-mix(in_srgb,var(--critical)_55%,transparent)]", count: "text-critical", chip: "bg-[var(--critical-soft)] text-critical" },
  proximo: { border: "border-[color-mix(in_srgb,var(--gold)_45%,transparent)]", count: "text-gold", chip: "bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold" },
  aldia: { border: "border-border", count: "text-muted-foreground", chip: "bg-muted text-muted-foreground" },
  pasada: { border: "border-border", count: "text-muted-foreground", chip: "bg-muted text-muted-foreground" },
} as const;

export function AudienciaCard({
  audiencia,
  now,
  onClick,
}: {
  audiencia: AudienciaConCaso;
  now: Date;
  onClick: () => void;
}) {
  const reduced = useReducedMotion();
  const target = audienciaDate(audiencia);
  const gravity = gravityFor(target, now);
  const g = GRAVITY[gravity];
  const Icon = audiencia.tipo === "audiencia" ? Gavel : Users;
  const isCritical = gravity === "critico";
  const hora = formatHora(audiencia.hora);

  return (
    <div className="relative">
      {isCritical && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: "0 0 24px 1px var(--critical-glow)",
            opacity: reduced ? 0.5 : undefined,
            animation: reduced ? undefined : "breathe-glow 3s ease-in-out infinite",
          }}
        />
      )}
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={reduced ? undefined : { y: -3 }}
        whileTap={reduced ? undefined : { scale: 0.99 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className={cn(
          "group relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border glass p-4 text-left shadow-layered",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          g.border,
        )}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-foreground/80">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate font-display text-base font-semibold text-foreground">{audiencia.titulo}</h4>
            <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-lg bg-muted/70 px-2 py-1 text-xs font-semibold tabular", g.count)}>
              <Timer className="h-3.5 w-3.5" strokeWidth={2} />
              {countdownFor(target, now)}
            </span>
          </div>
          {audiencia.caso && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{audiencia.caso.titulo}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {hora && (
              <span className="inline-flex items-center gap-1 tabular">
                <Clock className="h-3.5 w-3.5" /> {hora}
              </span>
            )}
            {audiencia.lugar && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{audiencia.lugar}</span>
              </span>
            )}
            {!hora && !audiencia.lugar && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Sin hora
              </span>
            )}
          </div>
        </div>
      </motion.button>
    </div>
  );
}
