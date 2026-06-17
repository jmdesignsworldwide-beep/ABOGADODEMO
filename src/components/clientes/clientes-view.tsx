"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Scale,
  Search,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumButton } from "@/components/ui/premium-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/field";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ClienteFormModal } from "./cliente-form-modal";
import { deleteCliente } from "@/app/(app)/clientes/actions";
import { CLIENTE_TIPO_LABEL, type Cliente, type ClienteConConteo } from "@/lib/db/types";

export function ClientesView({ clientes }: { clientes: ClienteConConteo[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState<Cliente | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) =>
      [c.nombre, c.documento, c.email, c.telefono]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [clientes, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"} en el bufete`}
        action={
          <PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
            Nuevo cliente
          </PremiumButton>
        }
      />

      {/* Búsqueda */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, documento, correo…"
          className="pl-11"
          aria-label="Buscar clientes"
        />
      </div>

      {/* Lista */}
      {clientes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aún no hay clientes"
          description="Registra tu primer cliente para empezar a gestionar sus casos."
          action={
            <PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
              Nuevo cliente
            </PremiumButton>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description={`No encontramos clientes para “${query}”.`} />
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <StaggerItem key={c.id} className="h-full">
              <ClienteCard
                cliente={c}
                onEdit={() => setEditing(c)}
                onDelete={() => setDeleting(c)}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* Modales */}
      <ClienteFormModal open={creating} onClose={() => setCreating(false)} />
      {editing && (
        <ClienteFormModal open onClose={() => setEditing(null)} cliente={editing} />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Eliminar a ${deleting?.nombre ?? ""}`}
        description="Se eliminarán también sus casos y expedientes vinculados. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          if (!deleting) return { ok: false, error: "Sin selección" };
          const res = await deleteCliente(deleting.id);
          if (res.ok) router.refresh();
          return res;
        }}
      />
    </div>
  );
}

function ClienteCard({
  cliente,
  onEdit,
  onDelete,
}: {
  cliente: ClienteConConteo;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl glass p-5 shadow-layered transition-shadow duration-300 hover:glow-gold">
      {/* Acciones (no navegan) */}
      <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <IconBtn label="Editar" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Eliminar" onClick={onDelete} danger>
          <Trash2 className="h-4 w-4" />
        </IconBtn>
      </div>

      {/* Cuerpo clickeable → ficha */}
      <Link href={`/clientes/${cliente.id}`} className="block focus-visible:outline-none">
        <span className="absolute inset-0" aria-hidden />
        <div className="flex items-center gap-3">
          <Avatar nombre={cliente.nombre} />
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold text-foreground">
              {cliente.nombre}
            </h3>
            <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              {cliente.tipo === "empresa" ? (
                <Building2 className="h-3.5 w-3.5" />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
              {CLIENTE_TIPO_LABEL[cliente.tipo]}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {cliente.documento && (
            <p className="tabular">{cliente.documento}</p>
          )}
          {cliente.telefono && (
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0" /> {cliente.telefono}
            </p>
          )}
          {cliente.email && (
            <p className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{cliente.email}</span>
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-sm">
          <Scale className="h-4 w-4 text-gold" />
          <span className="tabular font-medium text-foreground">{cliente.casosCount}</span>
          <span className="text-muted-foreground">
            {cliente.casosCount === 1 ? "caso" : "casos"}
          </span>
        </div>
      </Link>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`grid h-8 w-8 place-items-center rounded-lg bg-surface/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground ${
        danger ? "hover:bg-[var(--critical-soft)] hover:text-critical" : "hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
