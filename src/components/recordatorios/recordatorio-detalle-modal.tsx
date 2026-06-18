"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarClock, CheckCircle2, Circle, Pencil, Scale, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { PremiumButton } from "@/components/ui/premium-button";
import { countdownFor, gravityFor } from "@/lib/agenda";
import type { RecordatorioConCaso } from "@/lib/db/types";

const ACCENT = { critico: "critical", proximo: "gold", aldia: "navy", pasada: "navy" } as const;

function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleString("es-DO", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function RecordatorioDetalleModal({
  recordatorio,
  now,
  open,
  onClose,
  onToggle,
  onEdit,
  onDelete,
}: {
  recordatorio: RecordatorioConCaso | null;
  now: Date;
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!recordatorio) return null;
  const target = new Date(recordatorio.fecha);
  const gravity = gravityFor(target, now);

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Recordatorio"
      title={recordatorio.titulo}
      accent={recordatorio.completado ? "navy" : ACCENT[gravity]}
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between">
          <PremiumButton variant="ghost" onClick={onDelete} leftIcon={<Trash2 className="h-4 w-4" />} type="button">Eliminar</PremiumButton>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <PremiumButton variant="outline" onClick={onEdit} leftIcon={<Pencil className="h-4 w-4" />} type="button">Editar</PremiumButton>
            <PremiumButton variant="gold" onClick={onToggle} leftIcon={recordatorio.completado ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />} type="button">
              {recordatorio.completado ? "Reabrir" : "Completar"}
            </PremiumButton>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {recordatorio.completado ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" /> Completado</span>
          ) : (
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${gravity === "critico" ? "bg-[var(--critical-soft)] text-critical" : gravity === "proximo" ? "bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] text-gold" : "bg-muted text-muted-foreground"}`}>
              {countdownFor(target, now)}
            </span>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5">
          <CalendarClock className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Fecha</p><p className="text-sm text-foreground">{fechaLarga(recordatorio.fecha)}</p></div>
        </div>

        {recordatorio.caso && (
          <Link href={`/casos/${recordatorio.caso.id}`} className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/60">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold"><Scale className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{recordatorio.caso.titulo}</span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        )}

        {recordatorio.nota && (
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Nota</h4>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">{recordatorio.nota}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
