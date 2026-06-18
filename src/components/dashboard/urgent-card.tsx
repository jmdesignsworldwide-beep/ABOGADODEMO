"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Gavel, Timer, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { audienciaDate, countdownFor, gravityFor } from "@/lib/agenda";
import type { AudienciaConCaso } from "@/lib/db/types";

const GRAVITY = {
  critico: {
    badge: "Crítico",
    border: "border-[color-mix(in_srgb,var(--critical)_55%,transparent)]",
    chip: "bg-[var(--critical-soft)] text-critical",
    count: "text-critical",
    dot: "bg-critical",
  },
  proximo: {
    badge: "Esta semana",
    border: "border-[color-mix(in_srgb,var(--gold)_45%,transparent)]",
    chip: "bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold",
    count: "text-gold",
    dot: "bg-gold",
  },
  aldia: {
    badge: "Al día",
    border: "border-border",
    chip: "bg-[color-mix(in_srgb,var(--navy)_16%,transparent)] text-foreground",
    count: "text-muted-foreground",
    dot: "bg-navy",
  },
  pasada: {
    badge: "Hoy",
    border: "border-border",
    chip: "bg-muted text-muted-foreground",
    count: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
} as const;

export function UrgentCard({
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

  return (
    <div className="relative h-full">
      {isCritical && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: "0 0 26px 2px var(--critical-glow)",
            opacity: reduced ? 0.5 : undefined,
            animation: reduced ? undefined : "breathe-glow 3s ease-in-out infinite",
          }}
        />
      )}

      <motion.button
        type="button"
        onClick={onClick}
        whileHover={reduced ? undefined : { y: -4 }}
        whileTap={reduced ? undefined : { scale: 0.99 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        className={cn(
          "group relative flex h-full w-full flex-col gap-3 overflow-hidden rounded-2xl border glass p-4 text-left shadow-layered",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          g.border,
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-foreground/80">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            {audiencia.tipo === "audiencia" ? "Audiencia" : "Cita"}
          </span>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold", g.chip)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", g.dot)} />
            {g.badge}
          </span>
        </div>

        <div className="min-w-0">
          <h4 className="truncate font-display text-lg font-semibold leading-snug text-foreground">
            {audiencia.caso?.titulo ?? audiencia.titulo}
          </h4>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{audiencia.titulo}</p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <p className="line-clamp-2 text-xs text-muted-foreground">{audiencia.lugar ?? "—"}</p>
          <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5 text-sm font-semibold tabular", g.count)}>
            <Timer className="h-4 w-4" strokeWidth={2} />
            {countdownFor(target, now)}
          </span>
        </div>

        <span className="pointer-events-none absolute inset-x-0 top-0 h-px rule-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </motion.button>
    </div>
  );
}
