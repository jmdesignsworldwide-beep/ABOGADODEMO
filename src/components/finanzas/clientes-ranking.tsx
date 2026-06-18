"use client";

import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatRD } from "@/lib/facturas";
import { Avatar } from "@/components/ui/avatar";
import type { ClienteRanking } from "@/lib/db/financiero";

export function ClientesRanking({ ranking }: { ranking: ClienteRanking[] }) {
  const maxPagado = Math.max(1, ...ranking.map((r) => r.pagado));

  return (
    <div className="rounded-2xl glass p-5 shadow-layered">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <Trophy className="h-5 w-5 text-gold" /> Clientes por ingreso
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Quién más aporta — y quién debe.</p>

      {ranking.length === 0 ? (
        <p className="mt-4 py-6 text-center text-sm text-muted-foreground">Aún no hay facturas registradas.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {ranking.map((r, i) => (
            <li key={r.clienteId}>
              <Link
                href={`/clientes/${r.clienteId}`}
                className="group block rounded-xl p-2.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-center text-xs font-semibold tabular text-muted-foreground">{i + 1}</span>
                  <Avatar nombre={r.nombre} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{r.nombre}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="whitespace-nowrap text-sm font-semibold tabular text-foreground">{formatRD(r.pagado)}</p>
                    {r.pendiente > 0 && (
                      <p className="whitespace-nowrap text-[11px] tabular text-gold">debe {formatRD(r.pendiente)}</p>
                    )}
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <div className="mt-2 pl-7">
                  <ProgressBar value={maxPagado > 0 ? Math.round((r.pagado / maxPagado) * 100) : 0} showValue={false} />
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
