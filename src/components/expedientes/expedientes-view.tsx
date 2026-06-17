"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, FileStack, Gavel, Pencil, Plus, Scale, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumButton } from "@/components/ui/premium-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ExpedienteFormModal } from "./expediente-form-modal";
import { deleteExpediente } from "@/app/(app)/expedientes/actions";
import type { Caso, ExpedienteConCaso } from "@/lib/db/types";

export function ExpedientesView({
  expedientes,
  casosSinExpediente,
}: {
  expedientes: ExpedienteConCaso[];
  casosSinExpediente: Pick<Caso, "id" | "titulo">[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ExpedienteConCaso | null>(null);
  const [deleting, setDeleting] = useState<ExpedienteConCaso | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return expedientes;
    return expedientes.filter((e) =>
      [e.numero, e.tribunal, e.juez, e.estado_procesal, e.caso?.titulo, e.caso?.cliente?.nombre]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [expedientes, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expedientes"
        subtitle={`${expedientes.length} ${expedientes.length === 1 ? "expediente" : "expedientes"} en tribunales`}
        action={
          <PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
            Nuevo expediente
          </PremiumButton>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por número, tribunal, juez, caso…"
          className="pl-11"
          aria-label="Buscar expedientes"
        />
      </div>

      {expedientes.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="Aún no hay expedientes"
          description="Crea un expediente y vincúlalo a un caso para llevar su trámite en tribunales."
          action={
            <PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
              Nuevo expediente
            </PremiumButton>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description={`No encontramos expedientes para “${query}”.`} />
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((e) => (
            <StaggerItem key={e.id} className="h-full">
              <ExpedienteCard exp={e} onEdit={() => setEditing(e)} onDelete={() => setDeleting(e)} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <ExpedienteFormModal open={creating} onClose={() => setCreating(false)} casos={casosSinExpediente} />
      {editing && (
        <ExpedienteFormModal
          open
          onClose={() => setEditing(null)}
          // El caso ya vinculado no está en "casosSinExpediente"; lo añadimos.
          casos={
            editing.caso
              ? [{ id: editing.caso.id, titulo: editing.caso.titulo }, ...casosSinExpediente]
              : casosSinExpediente
          }
          expediente={editing}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Eliminar expediente"
        description={`Se eliminará el expediente ${deleting?.numero ?? ""}. El caso vinculado no se elimina. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          if (!deleting) return { ok: false, error: "Sin selección" };
          const res = await deleteExpediente(deleting.id);
          if (res.ok) router.refresh();
          return res;
        }}
      />
    </div>
  );
}

function ExpedienteCard({
  exp,
  onEdit,
  onDelete,
}: {
  exp: ExpedienteConCaso;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl glass p-5 shadow-layered transition-shadow duration-300 hover:glow-gold">
      <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <IconBtn label="Editar" onClick={onEdit}><Pencil className="h-4 w-4" /></IconBtn>
        <IconBtn label="Eliminar" onClick={onDelete} danger><Trash2 className="h-4 w-4" /></IconBtn>
      </div>

      <Link href={`/expedientes/${exp.id}`} className="block focus-visible:outline-none">
        <span className="absolute inset-0" aria-hidden />
        <div className="flex items-center gap-3 pr-16">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold">
            <Gavel className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold tabular text-foreground">{exp.numero}</h3>
            {exp.estado_procesal && (
              <span className="mt-0.5 inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {exp.estado_procesal}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {exp.tribunal && <p className="line-clamp-2">{exp.tribunal}</p>}
          {exp.juez && <p className="text-xs">Juez: {exp.juez}</p>}
        </div>

        {exp.caso && (
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-sm">
            <Scale className="h-4 w-4 shrink-0 text-gold" />
            <span className="truncate text-foreground">{exp.caso.titulo}</span>
            {exp.caso.cliente && (
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" /> {exp.caso.cliente.nombre.split(" ")[0]}
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}

function IconBtn({ children, label, onClick, danger }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={`grid h-8 w-8 place-items-center rounded-lg bg-surface/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground ${
        danger ? "hover:bg-[var(--critical-soft)] hover:text-critical" : "hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
