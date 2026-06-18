"use client";

import { CalendarDays, Pencil, Tag, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { PremiumButton } from "@/components/ui/premium-button";
import { formatRD, fechaLargaRD } from "@/lib/facturas";
import { CATEGORIA_EGRESO_LABEL, type Egreso } from "@/lib/db/types";

export function EgresoDetalleModal({
  egreso,
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  egreso: Egreso | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!egreso) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Egreso"
      title={egreso.concepto}
      accent="critical"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between">
          <PremiumButton variant="ghost" onClick={onDelete} leftIcon={<Trash2 className="h-4 w-4" />} type="button">Eliminar</PremiumButton>
          <PremiumButton variant="gold" onClick={onEdit} leftIcon={<Pencil className="h-4 w-4" />} type="button">Editar</PremiumButton>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Monto</p>
          <p className="mt-1 font-display text-3xl font-semibold tabular text-critical">{formatRD(Number(egreso.monto))}</p>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
          <div className="flex items-start gap-3 bg-surface p-3.5">
            <Tag className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Categoría</dt><dd className="text-sm text-foreground">{CATEGORIA_EGRESO_LABEL[egreso.categoria]}</dd></div>
          </div>
          <div className="flex items-start gap-3 bg-surface p-3.5">
            <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Fecha</dt><dd className="text-sm text-foreground">{fechaLargaRD(egreso.fecha)}</dd></div>
          </div>
        </dl>
        {egreso.descripcion && (
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Descripción</h4>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">{egreso.descripcion}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
