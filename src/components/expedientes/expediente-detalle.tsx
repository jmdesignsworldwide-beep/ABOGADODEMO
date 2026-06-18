"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Gavel, Pencil, Scale, Trash2 } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ExpedienteFormModal } from "./expediente-form-modal";
import { deleteExpediente } from "@/app/(app)/expedientes/actions";
import {
  CASO_ESTADO_LABEL,
  CASO_ESTADO_STYLE,
  CASO_TIPO_LABEL,
  type Caso,
  type ExpedienteConCaso,
} from "@/lib/db/types";

export function ExpedienteDetalle({
  expediente,
  casosSinExpediente,
}: {
  expediente: ExpedienteConCaso;
  casosSinExpediente: Pick<Caso, "id" | "titulo">[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="space-y-6">
      <Link href="/expedientes" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Expedientes
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold">
            <Gavel className="h-7 w-7" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-semibold tabular text-foreground sm:text-3xl">{expediente.numero}</h2>
            {expediente.estado_procesal && (
              <span className="mt-1 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {expediente.estado_procesal}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2.5">
          <PremiumButton variant="outline" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditing(true)}>
            Editar
          </PremiumButton>
          <PremiumButton variant="ghost" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleting(true)}>
            Eliminar
          </PremiumButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl glass p-5 shadow-layered">
            <h3 className="font-display text-lg font-semibold text-foreground">Datos del expediente</h3>
            <dl className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
              <Cell label="Número" value={expediente.numero} tabular />
              <Cell label="Estado procesal" value={expediente.estado_procesal ?? "—"} />
              <Cell label="Tribunal" value={expediente.tribunal ?? "—"} full />
              <Cell label="Juez" value={expediente.juez ?? "—"} full />
            </dl>
          </div>
        </div>

        {/* Caso vinculado */}
        <div>
          <div className="rounded-2xl glass p-5 shadow-layered">
            <h3 className="font-display text-lg font-semibold text-foreground">Caso vinculado</h3>
            {expediente.caso ? (
              <Link
                href={`/casos/${expediente.caso.id}`}
                className="group mt-4 block rounded-xl p-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <Scale className="h-4 w-4 shrink-0 text-gold" />
                    {expediente.caso.titulo}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${CASO_ESTADO_STYLE[expediente.caso.estado]}`}>
                    {CASO_ESTADO_LABEL[expediente.caso.estado]}
                  </span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {CASO_TIPO_LABEL[expediente.caso.tipo]}
                  </span>
                </div>
                {expediente.caso.cliente && (
                  <p className="mt-2 text-xs text-muted-foreground">Cliente: {expediente.caso.cliente.nombre}</p>
                )}
              </Link>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Sin caso vinculado.</p>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <ExpedienteFormModal
          open
          onClose={() => setEditing(false)}
          casos={
            expediente.caso
              ? [{ id: expediente.caso.id, titulo: expediente.caso.titulo }, ...casosSinExpediente]
              : casosSinExpediente
          }
          expediente={expediente}
        />
      )}
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title="Eliminar expediente"
        description={`Se eliminará el expediente ${expediente.numero}. El caso vinculado no se elimina. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          const res = await deleteExpediente(expediente.id);
          if (res.ok) router.push("/expedientes");
          return res;
        }}
      />
    </div>
  );
}

function Cell({ label, value, tabular, full }: { label: string; value: string; tabular?: boolean; full?: boolean }) {
  return (
    <div className={`bg-surface p-3.5 ${full ? "sm:col-span-2" : ""}`}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 text-sm text-foreground ${tabular ? "tabular" : ""}`}>{value}</dd>
    </div>
  );
}
