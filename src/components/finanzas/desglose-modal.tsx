"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { formatRD } from "@/lib/facturas";
import { CATEGORIA_EGRESO_LABEL, type Egreso } from "@/lib/db/types";

export type DesgloseRow =
  | { kind: "factura"; id: string; titulo: string; sub: string; monto: number }
  | { kind: "egreso"; egreso: Egreso };

function fecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-DO", { day: "2-digit", month: "short" });
}

export function DesgloseModal({
  open,
  onClose,
  title,
  eyebrow,
  accent = "gold",
  total,
  rows,
  onEgreso,
  emptyText = "Sin movimientos en este desglose.",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  accent?: "gold" | "navy" | "critical";
  total?: number;
  rows: DesgloseRow[];
  onEgreso: (e: Egreso) => void;
  emptyText?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} eyebrow={eyebrow} title={title} accent={accent}>
      {typeof total === "number" && (
        <div className="mb-4 flex items-baseline justify-between rounded-xl bg-muted/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-display text-xl font-semibold tabular text-foreground">{formatRD(total)}</span>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) =>
            r.kind === "factura" ? (
              <Link
                key={r.id}
                href={`/facturacion/${r.id}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-500"><ArrowDownLeft className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{r.titulo}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.sub}</p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular text-emerald-500">{formatRD(r.monto)}</span>
              </Link>
            ) : (
              <button
                key={r.egreso.id}
                type="button"
                onClick={() => onEgreso(r.egreso)}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--critical-soft)] text-critical"><ArrowUpRight className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{r.egreso.concepto}</p>
                  <p className="truncate text-xs text-muted-foreground">{CATEGORIA_EGRESO_LABEL[r.egreso.categoria]} · {fecha(r.egreso.fecha)}</p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular text-critical">{formatRD(Number(r.egreso.monto))}</span>
              </button>
            ),
          )}
        </div>
      )}
    </Modal>
  );
}
