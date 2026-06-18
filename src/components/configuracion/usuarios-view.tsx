"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CalendarClock, CircleCheck, Plus, RefreshCw, ShieldCheck, Trash2, User } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumButton } from "@/components/ui/premium-button";
import { Avatar } from "@/components/ui/avatar";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UsuarioFormModal } from "./usuario-form-modal";
import { RenovarModal } from "./renovar-modal";
import { eliminarUsuario, setActivo } from "@/app/(app)/configuracion/actions";
import { cn } from "@/lib/utils";
import type { PerfilAdmin } from "@/lib/db/perfiles";

function diasRestantes(acceso_hasta: string | null): number | null {
  if (!acceso_hasta) return null;
  return Math.ceil((new Date(acceso_hasta).getTime() - Date.now()) / 86_400_000);
}

type Estado = { label: string; cls: string; detalle: string };
function estadoDe(p: PerfilAdmin): Estado {
  if (!p.activo) return { label: "Desactivada", cls: "bg-muted text-muted-foreground", detalle: "Acceso bloqueado" };
  const d = diasRestantes(p.acceso_hasta);
  if (d === null) return { label: "Sin vencimiento", cls: "bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] text-gold", detalle: "Acceso permanente" };
  if (d <= 0) return { label: "Vencida", cls: "bg-[var(--critical-soft)] text-critical", detalle: "Acceso expirado" };
  if (d <= 3) return { label: `${d} ${d === 1 ? "día" : "días"}`, cls: "bg-[var(--critical-soft)] text-critical", detalle: "Por vencer" };
  return { label: `${d} días`, cls: "bg-emerald-500/15 text-emerald-500", detalle: "restantes" };
}

export function UsuariosView({ perfiles, adminId }: { perfiles: PerfilAdmin[]; adminId: string }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [renovando, setRenovando] = useState<PerfilAdmin | null>(null);
  const [eliminando, setEliminando] = useState<PerfilAdmin | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleActivo(p: PerfilAdmin) {
    setBusyId(p.id);
    await setActivo(p.id, !p.activo);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de usuarios"
        subtitle="Crea y administra los accesos temporales de tus clientes"
        action={
          <PremiumButton variant="gold" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
            Nueva cuenta
          </PremiumButton>
        }
      />

      <Stagger className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {perfiles.map((p) => {
          const est = estadoDe(p);
          const esYo = p.id === adminId;
          const esAdmin = p.rol === "admin";
          return (
            <StaggerItem key={p.id}>
              <div className="rounded-2xl glass p-5 shadow-layered">
                <div className="flex items-start gap-3">
                  <Avatar nombre={p.username} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-lg font-semibold text-foreground">{p.username}</h3>
                      {esYo && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">Tú</span>}
                    </div>
                    <span className={cn("mt-1 inline-flex items-center gap-1 text-xs font-medium", esAdmin ? "text-gold" : "text-muted-foreground")}>
                      {esAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      {esAdmin ? "Administrador" : "Cliente"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular", est.cls)}>
                      {est.label}
                    </span>
                    <p className="mt-1 text-[11px] text-muted-foreground">{est.detalle}</p>
                  </div>
                </div>

                {!esAdmin && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    <PremiumButton size="sm" variant="outline" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => setRenovando(p)}>
                      Renovar
                    </PremiumButton>
                    <PremiumButton
                      size="sm"
                      variant="ghost"
                      loading={busyId === p.id}
                      leftIcon={p.activo ? <Ban className="h-3.5 w-3.5" /> : <CircleCheck className="h-3.5 w-3.5" />}
                      onClick={() => toggleActivo(p)}
                    >
                      {p.activo ? "Desactivar" : "Activar"}
                    </PremiumButton>
                    <PremiumButton size="sm" variant="ghost" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setEliminando(p)}>
                      Eliminar
                    </PremiumButton>
                  </div>
                )}
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      <UsuarioFormModal open={creating} onClose={() => setCreating(false)} />
      <RenovarModal perfil={renovando} open={Boolean(renovando)} onClose={() => setRenovando(null)} />
      <ConfirmDialog
        open={Boolean(eliminando)}
        onClose={() => setEliminando(null)}
        title={`Eliminar a ${eliminando?.username ?? ""}`}
        description="Se eliminará la cuenta y su acceso por completo. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          if (!eliminando) return { ok: false, error: "Sin selección" };
          const res = await eliminarUsuario(eliminando.id);
          if (res.ok) router.refresh();
          return res;
        }}
      />

      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p>El acceso se valida en el servidor en cada visita: cuando una cuenta vence o se desactiva, el cliente
          ve la pantalla de acceso expirado y no puede entrar, ni siquiera por URL directa.</p>
      </div>
    </div>
  );
}
