"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Download, Scale, Trash2, User } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { descargarContratoPDF } from "@/lib/contrato-pdf";
import { eliminarContrato } from "@/app/(app)/contratos/actions";
import { PLANTILLA_LABEL, type PlantillaKey } from "@/lib/contratos/templates";
import type { ContratoConVinculos } from "@/lib/db/types";

function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });
}

export function ContratoDetalle({ contrato }: { contrato: ContratoConVinculos }) {
  const router = useRouter();
  const [eliminando, setEliminando] = useState(false);

  return (
    <div className="space-y-6">
      <Link href="/contratos" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Documentos
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{contrato.titulo}</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium">{PLANTILLA_LABEL[contrato.plantilla as PlantillaKey] ?? contrato.plantilla}</span>
            <span>{fechaLarga(contrato.created_at)}</span>
          </div>
        </div>
        <div className="flex gap-2.5">
          <PremiumButton variant="gold" leftIcon={<Download className="h-4 w-4" />} onClick={() => descargarContratoPDF(contrato.titulo, contrato.contenido)}>Descargar PDF</PremiumButton>
          <PremiumButton variant="ghost" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setEliminando(true)}>Eliminar</PremiumButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Contenido */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl glass p-5 shadow-layered sm:p-6">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">{contrato.contenido}</pre>
            <p className="mt-6 border-t border-border pt-3 text-center text-xs italic text-muted-foreground">Documento de ejemplo — no es un documento legal válido.</p>
          </div>
        </div>

        {/* Vínculos */}
        <div className="space-y-4">
          {contrato.cliente && (
            <div className="rounded-2xl glass p-5 shadow-layered">
              <h3 className="font-display text-lg font-semibold text-foreground">Cliente</h3>
              <Link href={`/clientes/${contrato.cliente.id}`} className="group mt-3 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy text-gold"><User className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{contrato.cliente.nombre}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
          {contrato.caso && (
            <div className="rounded-2xl glass p-5 shadow-layered">
              <h3 className="font-display text-lg font-semibold text-foreground">Caso vinculado</h3>
              <Link href={`/casos/${contrato.caso.id}`} className="group mt-3 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold"><Scale className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{contrato.caso.titulo}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={eliminando}
        onClose={() => setEliminando(false)}
        title="Eliminar documento"
        description={`Se eliminará “${contrato.titulo}”. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          const res = await eliminarContrato(contrato.id);
          if (res.ok) router.push("/contratos");
          return res;
        }}
      />
    </div>
  );
}
