"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { PremiumButton } from "./premium-button";

/**
 * Diálogo de confirmación reutilizable (p. ej. eliminar). Ejecuta `onConfirm`
 * (async), muestra estado de carga y errores. Acento crítico por defecto.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "¿Confirmar acción?",
  description,
  confirmLabel = "Eliminar",
  eyebrow = "Confirmar",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<{ ok: boolean; error?: string }>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  eyebrow?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setError(null);
    setLoading(true);
    const res = await onConfirm();
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo completar la acción.");
      return;
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={eyebrow}
      title={title}
      accent="critical"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PremiumButton variant="ghost" onClick={onClose} type="button">
            Cancelar
          </PremiumButton>
          <PremiumButton variant="gold" onClick={handle} loading={loading} type="button">
            {confirmLabel}
          </PremiumButton>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        {description ?? "Esta acción no se puede deshacer."}
      </p>
      {error && (
        <p className="mt-3 rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">
          {error}
        </p>
      )}
    </Modal>
  );
}
