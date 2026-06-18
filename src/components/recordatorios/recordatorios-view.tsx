"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { BellRing, CheckCircle2, Circle, Plus, Timer } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumButton } from "@/components/ui/premium-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RecordatorioFormModal } from "./recordatorio-form-modal";
import { RecordatorioDetalleModal } from "./recordatorio-detalle-modal";
import { toggleCompletado, eliminarRecordatorio } from "@/app/(app)/recordatorios/actions";
import { countdownFor, gravityFor } from "@/lib/agenda";
import { cn } from "@/lib/utils";
import type { Caso, Recordatorio, RecordatorioConCaso } from "@/lib/db/types";

const GRAVITY = {
  critico: { border: "border-[color-mix(in_srgb,var(--critical)_55%,transparent)]", chip: "bg-[var(--critical-soft)] text-critical" },
  proximo: { border: "border-[color-mix(in_srgb,var(--gold)_45%,transparent)]", chip: "bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold" },
  aldia: { border: "border-border", chip: "bg-muted text-muted-foreground" },
  pasada: { border: "border-border", chip: "bg-muted text-muted-foreground" },
} as const;

export function RecordatoriosView({
  recordatorios,
  casos,
  nowISO,
}: {
  recordatorios: RecordatorioConCaso[];
  casos: Pick<Caso, "id" | "titulo">[];
  nowISO: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = useMemo(() => new Date(nowISO), [nowISO]);
  const [creating, setCreating] = useState(() => searchParams.get("nuevo") === "1");
  const [sel, setSel] = useState<RecordatorioConCaso | null>(null);
  const [editing, setEditing] = useState<Recordatorio | null>(null);
  const [deleting, setDeleting] = useState<Recordatorio | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const pendientes = recordatorios.filter((r) => !r.completado);
  const completados = recordatorios.filter((r) => r.completado);
  const criticos = pendientes.filter((r) => gravityFor(new Date(r.fecha), now) === "critico").length;

  async function toggle(r: Recordatorio) {
    setBusy(r.id);
    await toggleCompletado(r.id, !r.completado);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recordatorios"
        subtitle={`${pendientes.length} pendientes${criticos ? ` · ${criticos} crítico${criticos > 1 ? "s" : ""}` : ""}`}
        action={<PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>Nuevo recordatorio</PremiumButton>}
      />

      {recordatorios.length === 0 ? (
        <EmptyState icon={BellRing} title="Sin recordatorios" description="Crea tu primer recordatorio de plazo, vencimiento o audiencia." action={<PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>Nuevo recordatorio</PremiumButton>} />
      ) : (
        <>
          {pendientes.length > 0 && (
            <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pendientes.map((r) => (
                <StaggerItem key={r.id} className="h-full">
                  <Card r={r} now={now} busy={busy === r.id} onToggle={() => toggle(r)} onOpen={() => setSel(r)} />
                </StaggerItem>
              ))}
            </Stagger>
          )}

          {completados.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" /> Completados ({completados.length})
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {completados.map((r) => (
                  <Card key={r.id} r={r} now={now} busy={busy === r.id} onToggle={() => toggle(r)} onOpen={() => setSel(r)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <RecordatorioFormModal open={creating} onClose={() => setCreating(false)} casos={casos} />
      {editing && <RecordatorioFormModal open onClose={() => setEditing(null)} casos={casos} recordatorio={editing} />}
      <RecordatorioDetalleModal
        recordatorio={sel}
        now={now}
        open={Boolean(sel)}
        onClose={() => setSel(null)}
        onToggle={() => { if (sel) { toggle(sel); setSel(null); } }}
        onEdit={() => { setEditing(sel); setSel(null); }}
        onDelete={() => { setDeleting(sel); setSel(null); }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Eliminar recordatorio"
        description={`Se eliminará “${deleting?.titulo ?? ""}”. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          if (!deleting) return { ok: false, error: "Sin selección" };
          const res = await eliminarRecordatorio(deleting.id);
          if (res.ok) router.refresh();
          return res;
        }}
      />
    </div>
  );
}

function Card({ r, now, busy, onToggle, onOpen }: { r: RecordatorioConCaso; now: Date; busy: boolean; onToggle: () => void; onOpen: () => void }) {
  const reduced = useReducedMotion();
  const target = new Date(r.fecha);
  const gravity = gravityFor(target, now);
  const g = GRAVITY[gravity];
  const isCritical = gravity === "critico" && !r.completado;

  return (
    <div className="relative h-full">
      {isCritical && (
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl" style={{ boxShadow: "0 0 24px 1px var(--critical-glow)", opacity: reduced ? 0.5 : undefined, animation: reduced ? undefined : "breathe-glow 3s ease-in-out infinite" }} />
      )}
      <div className={cn("relative flex h-full items-start gap-3 rounded-2xl border glass p-4 shadow-layered", r.completado ? "border-border opacity-70" : g.border)}>
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          aria-label={r.completado ? "Reabrir" : "Completar"}
          className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-emerald-500 disabled:opacity-50"
        >
          {r.completado ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}
        </button>

        <motion.button
          type="button"
          onClick={onOpen}
          whileTap={reduced ? undefined : { scale: 0.99 }}
          className="min-w-0 flex-1 text-left focus-visible:outline-none"
        >
          <h4 className={cn("truncate font-display text-base font-semibold text-foreground", r.completado && "line-through opacity-70")}>{r.titulo}</h4>
          {r.caso && <p className="mt-0.5 truncate text-sm text-muted-foreground">{r.caso.titulo}</p>}
          <div className="mt-2">
            {r.completado ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-500"><CheckCircle2 className="h-3 w-3" /> Completado</span>
            ) : (
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular", g.chip)}>
                <Timer className="h-3 w-3" /> {countdownFor(target, now)}
              </span>
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
}
