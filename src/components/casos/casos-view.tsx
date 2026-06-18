"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus, Scale, Search, Trash2, User } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumButton } from "@/components/ui/premium-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CasoFormModal } from "./caso-form-modal";
import { deleteCaso } from "@/app/(app)/casos/actions";
import {
  CASO_ESTADO_LABEL,
  CASO_ESTADO_STYLE,
  CASO_TIPO_LABEL,
  type Caso,
  type CasoConRelaciones,
  type CasoEstado,
  type CasoTipo,
  type Cliente,
} from "@/lib/db/types";

export function CasosView({
  casos,
  clientes,
}: {
  casos: CasoConRelaciones[];
  clientes: Pick<Cliente, "id" | "nombre">[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState<CasoEstado | "todos">("todos");
  const [tipo, setTipo] = useState<CasoTipo | "todos">("todos");
  const [creating, setCreating] = useState(() => searchParams.get("nuevo") === "1");
  const [editing, setEditing] = useState<Caso | null>(null);
  const [deleting, setDeleting] = useState<Caso | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return casos.filter((c) => {
      if (estado !== "todos" && c.estado !== estado) return false;
      if (tipo !== "todos" && c.tipo !== tipo) return false;
      if (!q) return true;
      return [c.titulo, c.parte_contraria, c.abogado, c.cliente?.nombre]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [casos, query, estado, tipo]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Casos"
        subtitle={`${casos.length} ${casos.length === 1 ? "caso" : "casos"} registrados`}
        action={
          <PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
            Nuevo caso
          </PremiumButton>
        }
      />

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar caso, cliente, parte…"
            className="pl-11"
            aria-label="Buscar casos"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:w-auto">
          <Select value={estado} onChange={(e) => setEstado(e.target.value as CasoEstado | "todos")} aria-label="Filtrar por estado" className="sm:w-40">
            <option value="todos">Todos los estados</option>
            {Object.entries(CASO_ESTADO_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value as CasoTipo | "todos")} aria-label="Filtrar por tipo" className="sm:w-40">
            <option value="todos">Todos los tipos</option>
            {Object.entries(CASO_TIPO_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Lista */}
      {casos.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Aún no hay casos"
          description="Crea tu primer caso y vincúlalo a un cliente."
          action={
            <PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
              Nuevo caso
            </PremiumButton>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description="Ajusta la búsqueda o los filtros." />
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((c) => (
            <StaggerItem key={c.id} className="h-full">
              <CasoCard caso={c} onEdit={() => setEditing(c)} onDelete={() => setDeleting(c)} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* Modales */}
      <CasoFormModal open={creating} onClose={() => setCreating(false)} clientes={clientes} />
      {editing && <CasoFormModal open onClose={() => setEditing(null)} clientes={clientes} caso={editing} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Eliminar caso`}
        description={`Se eliminará “${deleting?.titulo ?? ""}” y su expediente vinculado. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          if (!deleting) return { ok: false, error: "Sin selección" };
          const res = await deleteCaso(deleting.id);
          if (res.ok) router.refresh();
          return res;
        }}
      />
    </div>
  );
}

function CasoCard({
  caso,
  onEdit,
  onDelete,
}: {
  caso: CasoConRelaciones;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl glass p-5 shadow-layered transition-shadow duration-300 hover:glow-gold">
      <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <IconBtn label="Editar" onClick={onEdit}><Pencil className="h-4 w-4" /></IconBtn>
        <IconBtn label="Eliminar" onClick={onDelete} danger><Trash2 className="h-4 w-4" /></IconBtn>
      </div>

      <Link href={`/casos/${caso.id}`} className="block focus-visible:outline-none">
        <span className="absolute inset-0" aria-hidden />
        <div className="flex items-start justify-between gap-3 pr-16">
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{caso.titulo}</h3>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CASO_ESTADO_STYLE[caso.estado]}`}>
            {CASO_ESTADO_LABEL[caso.estado]}
          </span>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {CASO_TIPO_LABEL[caso.tipo]}
          </span>
        </div>

        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          {caso.cliente && (
            <p className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 shrink-0" /> {caso.cliente.nombre}
            </p>
          )}
          {caso.parte_contraria && <p className="truncate">vs. {caso.parte_contraria}</p>}
          {caso.expediente && <p className="tabular text-xs">{caso.expediente.numero}</p>}
        </div>

        <div className="mt-4">
          <ProgressBar value={caso.avance} showValue label="Avance" />
        </div>
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
