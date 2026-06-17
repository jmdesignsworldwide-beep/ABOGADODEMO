"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Gavel,
  Pencil,
  Scale,
  Trash2,
  User,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PremiumButton } from "@/components/ui/premium-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CasoFormModal } from "./caso-form-modal";
import { deleteCaso } from "@/app/(app)/casos/actions";
import {
  CASO_ESTADO_LABEL,
  CASO_ESTADO_STYLE,
  CASO_TIPO_LABEL,
  type CasoConRelaciones,
  type Cliente,
} from "@/lib/db/types";

export function CasoDetalle({
  caso,
  clientes,
}: {
  caso: CasoConRelaciones;
  clientes: Pick<Cliente, "id" | "nombre">[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="space-y-6">
      <Link href="/casos" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Casos
      </Link>

      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{caso.titulo}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CASO_ESTADO_STYLE[caso.estado]}`}>
              {CASO_ESTADO_LABEL[caso.estado]}
            </span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {CASO_TIPO_LABEL[caso.tipo]}
            </span>
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
        {/* Columna principal */}
        <div className="space-y-4 lg:col-span-2">
          {/* Avance */}
          <div className="rounded-2xl glass p-5 shadow-layered">
            <h3 className="font-display text-lg font-semibold text-foreground">Avance del caso</h3>
            <div className="mt-4">
              <ProgressBar value={caso.avance} showValue label="Progreso" />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
              <Cell label="Tipo" value={CASO_TIPO_LABEL[caso.tipo]} />
              <Cell label="Estado" value={CASO_ESTADO_LABEL[caso.estado]} />
              <Cell label="Abogado asignado" value={caso.abogado ?? "—"} />
              <Cell label="Parte contraria" value={caso.parte_contraria ?? "—"} />
            </dl>
          </div>

          {/* Descripción */}
          {caso.descripcion && (
            <div className="rounded-2xl glass p-5 shadow-layered">
              <h3 className="font-display text-lg font-semibold text-foreground">Descripción</h3>
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{caso.descripcion}</p>
            </div>
          )}

          {/* Expediente vinculado */}
          <div className="rounded-2xl glass p-5 shadow-layered">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Gavel className="h-5 w-5 text-gold" /> Expediente
            </h3>
            {caso.expediente ? (
              <dl className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
                <Cell label="Número" value={caso.expediente.numero} tabular />
                <Cell label="Estado procesal" value={caso.expediente.estado_procesal ?? "—"} />
                <Cell label="Tribunal" value={caso.expediente.tribunal ?? "—"} />
                <Cell label="Juez" value={caso.expediente.juez ?? "—"} />
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Este caso aún no tiene expediente. Podrás crearlo desde el módulo de Expedientes.
              </p>
            )}
          </div>
        </div>

        {/* Columna lateral: cliente vinculado */}
        <div className="space-y-4">
          <div className="rounded-2xl glass p-5 shadow-layered">
            <h3 className="font-display text-lg font-semibold text-foreground">Cliente</h3>
            {caso.cliente ? (
              <Link
                href={`/clientes/${caso.cliente.id}`}
                className="group mt-4 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <Avatar nombre={caso.cliente.nombre} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{caso.cliente.nombre}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    {caso.cliente.tipo === "empresa" ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    Ver ficha
                  </span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Sin cliente vinculado.</p>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <Scale className="h-4 w-4" /> Documentos y audiencias
            </p>
            <p className="mt-1">Disponibles en una próxima tanda.</p>
          </div>
        </div>
      </div>

      {/* Modales */}
      {editing && <CasoFormModal open onClose={() => setEditing(false)} clientes={clientes} caso={caso} />}
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title="Eliminar caso"
        description={`Se eliminará “${caso.titulo}” y su expediente vinculado. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          const res = await deleteCaso(caso.id);
          if (res.ok) router.push("/casos");
          return res;
        }}
      />
    </div>
  );
}

function Cell({ label, value, tabular }: { label: string; value: string; tabular?: boolean }) {
  return (
    <div className="bg-surface p-3.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 text-sm text-foreground ${tabular ? "tabular" : ""}`}>{value}</dd>
    </div>
  );
}
