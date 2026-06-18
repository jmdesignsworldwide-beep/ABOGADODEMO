"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PremiumButton } from "@/components/ui/premium-button";
import { crearEgreso, actualizarEgreso } from "@/app/(app)/finanzas/actions";
import { CATEGORIA_EGRESO_LABEL, type CategoriaEgreso, type Egreso, type EgresoInput } from "@/lib/db/types";

const hoy = () => new Date().toISOString().slice(0, 10);

export function EgresoFormModal({
  open,
  onClose,
  egreso,
}: {
  open: boolean;
  onClose: () => void;
  egreso?: Egreso;
}) {
  const router = useRouter();
  const isEdit = Boolean(egreso);
  const [form, setForm] = useState<EgresoInput>(
    egreso
      ? { concepto: egreso.concepto, categoria: egreso.categoria, monto: egreso.monto, fecha: egreso.fecha, descripcion: egreso.descripcion ?? "" }
      : { concepto: "", categoria: "servicios", monto: 0, fecha: hoy(), descripcion: "" },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof EgresoInput>(k: K, v: EgresoInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.concepto.trim()) return setError("El concepto es obligatorio.");
    if (!form.monto || form.monto <= 0) return setError("Ingresa un monto válido.");
    setLoading(true);
    const res = isEdit ? await actualizarEgreso(egreso!.id, form) : await crearEgreso(form);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={isEdit ? "Editar egreso" : "Nuevo egreso"}
      title={isEdit ? egreso!.concepto : "Registrar egreso"}
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PremiumButton variant="ghost" onClick={onClose} type="button">Cancelar</PremiumButton>
          <PremiumButton variant="gold" type="submit" form="egreso-form" loading={loading}>{isEdit ? "Guardar" : "Registrar"}</PremiumButton>
        </div>
      }
    >
      <form id="egreso-form" onSubmit={onSubmit} className="space-y-4">
        <Field label="Concepto" htmlFor="concepto" required>
          <Input id="concepto" value={form.concepto} onChange={(e) => set("concepto", e.target.value)} placeholder="Ej. Alquiler de oficina" autoFocus />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Categoría" htmlFor="categoria">
            <Select id="categoria" value={form.categoria} onChange={(e) => set("categoria", e.target.value as CategoriaEgreso)}>
              {Object.entries(CATEGORIA_EGRESO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Monto (RD$)" htmlFor="monto" required>
            <Input id="monto" type="number" min={0} step="0.01" value={form.monto || ""} onChange={(e) => set("monto", Number(e.target.value))} placeholder="0.00" className="tabular" />
          </Field>
        </div>
        <Field label="Fecha" htmlFor="fecha" required>
          <Input id="fecha" type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
        </Field>
        <Field label="Descripción" htmlFor="descripcion">
          <Textarea id="descripcion" value={form.descripcion ?? ""} onChange={(e) => set("descripcion", e.target.value)} placeholder="Detalle del egreso…" />
        </Field>
        {error && <p className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">{error}</p>}
      </form>
    </Modal>
  );
}
