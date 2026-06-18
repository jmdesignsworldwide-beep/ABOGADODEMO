"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { PremiumButton } from "@/components/ui/premium-button";
import { DiasSelector, resolveDias, type DiasMode } from "./dias-selector";
import { extenderAcceso } from "@/app/(app)/configuracion/actions";
import type { PerfilAdmin } from "@/lib/db/perfiles";

export function RenovarModal({
  perfil,
  open,
  onClose,
}: {
  perfil: PerfilAdmin | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<DiasMode>("15");
  const [custom, setCustom] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    if (!perfil) return;
    setError(null);
    setLoading(true);
    const res = await extenderAcceso(perfil.id, resolveDias(mode, custom));
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Renovar acceso"
      title={perfil ? `Renovar a ${perfil.username}` : "Renovar"}
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PremiumButton variant="ghost" onClick={onClose} type="button">Cancelar</PremiumButton>
          <PremiumButton variant="gold" onClick={onConfirm} loading={loading} type="button">Aplicar</PremiumButton>
        </div>
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Se sumará el tiempo al acceso vigente (o desde hoy si ya venció) y la cuenta quedará activa.
      </p>
      <DiasSelector mode={mode} custom={custom} onMode={setMode} onCustom={setCustom} label="Extender por" />
      {error && (
        <p className="mt-3 rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">{error}</p>
      )}
    </Modal>
  );
}
