"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import { formatRD } from "@/lib/facturas";
import { FACTURA_ESTADO_LABEL, FACTURA_ESTADO_STYLE } from "@/lib/db/types";
import type { FacturaResumen } from "@/lib/db/facturas";

function fecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
}

export function ResumenFinanciero({ facturas }: { facturas: FacturaResumen[] }) {
  const pagado = facturas.filter((f) => f.estado === "pagada").reduce((a, f) => a + f.total, 0);
  const pendiente = facturas.filter((f) => f.estado === "pendiente").reduce((a, f) => a + f.total, 0);
  const total = pagado + pendiente;

  return (
    <div className="rounded-2xl glass p-5 shadow-layered">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <Wallet className="h-5 w-5 text-gold" /> Resumen financiero
      </h3>

      {facturas.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Este cliente aún no tiene facturas.</p>
      ) : (
        <>
          {/* Total facturado */}
          <div className="mt-4 rounded-xl bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total facturado</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular text-foreground">
              <CountUp value={total} prefix="RD$ " decimals={2} />
            </p>
          </div>

          {/* Pagado / Pendiente */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pagado</p>
              <p className="mt-0.5 tabular text-base font-semibold text-emerald-500">
                <CountUp value={pagado} prefix="RD$ " decimals={2} />
              </p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pendiente</p>
              <p className="mt-0.5 tabular text-base font-semibold text-gold">
                <CountUp value={pendiente} prefix="RD$ " decimals={2} />
              </p>
            </div>
          </div>

          {/* Mini-lista de facturas */}
          <div className="mt-4 space-y-2">
            {facturas.map((f) => (
              <Link
                key={f.id}
                href={`/facturacion/${f.id}`}
                className="flex items-center gap-3 rounded-xl border border-border p-2.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium tabular text-foreground">{f.numero}</p>
                  <p className="text-xs text-muted-foreground">{fecha(f.fecha)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${FACTURA_ESTADO_STYLE[f.estado]}`}>
                  {FACTURA_ESTADO_LABEL[f.estado]}
                </span>
                <span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular text-foreground">{formatRD(f.total)}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
