"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, List, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumButton } from "@/components/ui/premium-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { AgendaList } from "./agenda-list";
import { AgendaCalendar } from "./agenda-calendar";
import { AudienciaDetalleModal } from "./audiencia-detalle-modal";
import { AudienciaFormModal } from "./audiencia-form-modal";
import { deleteAudiencia } from "@/app/(app)/agenda/actions";
import type { AudienciaConCaso, Caso } from "@/lib/db/types";

type View = "lista" | "mes";

export function AgendaView({
  audiencias,
  casos,
  nowISO,
}: {
  audiencias: AudienciaConCaso[];
  casos: Pick<Caso, "id" | "titulo">[];
  nowISO: string;
}) {
  const router = useRouter();
  const now = new Date(nowISO);
  const [view, setView] = useState<View>("lista");
  const [selected, setSelected] = useState<AudienciaConCaso | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AudienciaConCaso | null>(null);
  const [deleting, setDeleting] = useState<AudienciaConCaso | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        subtitle={`${audiencias.length} ${audiencias.length === 1 ? "evento" : "eventos"} en agenda`}
        action={
          <PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
            Nueva
          </PremiumButton>
        }
      />

      {/* Toggle Lista / Mes */}
      <div className="inline-flex rounded-xl glass p-1">
        <Toggle active={view === "lista"} onClick={() => setView("lista")} icon={<List className="h-4 w-4" />} label="Lista" />
        <Toggle active={view === "mes"} onClick={() => setView("mes")} icon={<CalendarDays className="h-4 w-4" />} label="Mes" />
      </div>

      {view === "lista" ? (
        <AgendaList audiencias={audiencias} now={now} onSelect={setSelected} />
      ) : (
        <AgendaCalendar audiencias={audiencias} now={now} onSelect={setSelected} />
      )}

      {/* Detalle */}
      <AudienciaDetalleModal
        audiencia={selected}
        now={now}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onEdit={() => {
          setEditing(selected);
          setSelected(null);
        }}
        onDelete={() => {
          setDeleting(selected);
          setSelected(null);
        }}
      />

      {/* Crear / Editar */}
      <AudienciaFormModal open={creating} onClose={() => setCreating(false)} casos={casos} />
      {editing && <AudienciaFormModal open onClose={() => setEditing(null)} casos={casos} audiencia={editing} />}

      {/* Eliminar */}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Eliminar de la agenda"
        description={`Se eliminará “${deleting?.titulo ?? ""}”. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          if (!deleting) return { ok: false, error: "Sin selección" };
          const res = await deleteAudiencia(deleting.id);
          if (res.ok) router.refresh();
          return res;
        }}
      />
    </div>
  );
}

function Toggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none",
        active ? "text-navy-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId="agenda-toggle"
          className="absolute inset-0 -z-10 rounded-lg bg-navy"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      {icon}
      {label}
    </button>
  );
}
