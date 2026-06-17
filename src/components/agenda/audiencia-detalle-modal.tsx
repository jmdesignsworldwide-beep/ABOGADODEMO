"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, MapPin, Pencil, Scale, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { PremiumButton } from "@/components/ui/premium-button";
import {
  AUDIENCIA_ESTADO_LABEL,
  AUDIENCIA_ESTADO_STYLE,
  AUDIENCIA_TIPO_LABEL,
  CASO_TIPO_LABEL,
  type AudienciaConCaso,
} from "@/lib/db/types";
import { audienciaDate, countdownFor, formatFechaLarga, formatHora, gravityFor } from "@/lib/agenda";

const GRAVITY_ACCENT = {
  critico: "critical",
  proximo: "gold",
  aldia: "navy",
  pasada: "navy",
} as const;

export function AudienciaDetalleModal({
  audiencia,
  now,
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  audiencia: AudienciaConCaso | null;
  now: Date;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!audiencia) return null;
  const target = audienciaDate(audiencia);
  const gravity = gravityFor(target, now);

  const rows = [
    { icon: CalendarDays, label: "Fecha", value: formatFechaLarga(audiencia) },
    { icon: Clock, label: "Hora", value: formatHora(audiencia.hora) ?? "Sin hora" },
    { icon: MapPin, label: "Lugar", value: audiencia.lugar ?? "—" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={AUDIENCIA_TIPO_LABEL[audiencia.tipo]}
      title={audiencia.titulo}
      accent={GRAVITY_ACCENT[gravity]}
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between">
          <PremiumButton variant="ghost" onClick={onDelete} leftIcon={<Trash2 className="h-4 w-4" />} type="button">
            Eliminar
          </PremiumButton>
          <PremiumButton variant="gold" onClick={onEdit} leftIcon={<Pencil className="h-4 w-4" />} type="button">
            Editar
          </PremiumButton>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${AUDIENCIA_ESTADO_STYLE[audiencia.estado]}`}>
            {AUDIENCIA_ESTADO_LABEL[audiencia.estado]}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              gravity === "critico"
                ? "bg-[var(--critical-soft)] text-critical"
                : gravity === "proximo"
                  ? "bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] text-gold"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {countdownFor(target, now)}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start gap-3 bg-surface p-3.5">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <r.icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{r.label}</dt>
                <dd className="text-sm text-foreground">{r.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        {/* Caso vinculado */}
        {audiencia.caso && (
          <Link
            href={`/casos/${audiencia.caso.id}`}
            className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/60"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold">
              <Scale className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{audiencia.caso.titulo}</p>
              <p className="text-xs text-muted-foreground">
                {CASO_TIPO_LABEL[audiencia.caso.tipo]}
                {audiencia.caso.cliente ? ` · ${audiencia.caso.cliente.nombre}` : ""}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        )}

        {audiencia.notas && (
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Notas</h4>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">{audiencia.notas}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
