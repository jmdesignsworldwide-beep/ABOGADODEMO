"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileSignature, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumButton } from "@/components/ui/premium-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { GeneradorModal } from "./generador-modal";
import { PLANTILLA_LABEL, type PlantillaKey } from "@/lib/contratos/templates";
import type { CasoGen, ClienteGen } from "@/lib/db/contratos";
import type { ContratoConVinculos } from "@/lib/db/types";

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
}

export function ContratosView({
  contratos,
  clientes,
  casos,
}: {
  contratos: ContratoConVinculos[];
  clientes: ClienteGen[];
  casos: CasoGen[];
}) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(() => searchParams.get("nuevo") === "1");
  const defaultClienteId = searchParams.get("cliente") ?? undefined;
  const defaultCasoId = searchParams.get("caso") ?? undefined;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contratos;
    return contratos.filter((c) => [c.titulo, c.cliente?.nombre, c.caso?.titulo].filter(Boolean).some((v) => v!.toLowerCase().includes(q)));
  }, [contratos, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos / Contratos"
        subtitle={`${contratos.length} ${contratos.length === 1 ? "documento generado" : "documentos generados"}`}
        action={<PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>Nuevo documento</PremiumButton>}
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar documento, cliente, caso…" className="pl-11" aria-label="Buscar documentos" />
      </div>

      {contratos.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="Aún no hay documentos generados"
          description="Elige una plantilla y deja que se autocomplete con los datos de tu cliente."
          action={<PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>Generar documento</PremiumButton>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description="Ajusta la búsqueda." />
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <StaggerItem key={c.id} className="h-full">
              <Link href={`/contratos/${c.id}`} className="flex h-full flex-col gap-3 rounded-2xl glass p-5 shadow-layered transition-shadow duration-300 hover:glow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold"><FileSignature className="h-5 w-5" strokeWidth={1.75} /></span>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-foreground">{c.titulo}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{PLANTILLA_LABEL[c.plantilla as PlantillaKey] ?? c.plantilla}</p>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="truncate">{c.cliente?.nombre ?? "Sin cliente"}</span>
                  <span className="shrink-0">{fecha(c.created_at)}</span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <GeneradorModal open={creating} onClose={() => setCreating(false)} clientes={clientes} casos={casos} defaultClienteId={defaultClienteId} defaultCasoId={defaultCasoId} />
    </div>
  );
}
