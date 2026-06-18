import Link from "next/link";
import { FileSignature, Plus } from "lucide-react";
import { PLANTILLA_LABEL, type PlantillaKey } from "@/lib/contratos/templates";
import type { ContratoConVinculos } from "@/lib/db/types";

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
}

/** Sección de documentos generados dentro de una ficha de cliente o caso. */
export function ContratosSection({
  contratos,
  generarHref,
}: {
  contratos: ContratoConVinculos[];
  generarHref: string;
}) {
  return (
    <div className="rounded-2xl glass p-5 shadow-layered">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
          <FileSignature className="h-5 w-5 text-gold" /> Documentos generados
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular text-muted-foreground">{contratos.length}</span>
        </h3>
        <Link href={generarHref} className="inline-flex items-center gap-1 text-sm font-medium text-gold transition-opacity hover:opacity-80">
          <Plus className="h-4 w-4" /> Generar
        </Link>
      </div>

      {contratos.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Aún no hay documentos generados.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {contratos.map((c) => (
            <Link key={c.id} href={`/contratos/${c.id}`} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold"><FileSignature className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{c.titulo}</p>
                <p className="truncate text-xs text-muted-foreground">{PLANTILLA_LABEL[c.plantilla as PlantillaKey] ?? c.plantilla} · {fecha(c.created_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
