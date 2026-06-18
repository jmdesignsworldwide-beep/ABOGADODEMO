"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PremiumButton } from "@/components/ui/premium-button";
import { crearRecordatorio, actualizarRecordatorio } from "@/app/(app)/recordatorios/actions";
import type { Caso, Recordatorio, RecordatorioInput } from "@/lib/db/types";

function isoToLocal(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function localToISO(local: string): string {
  return new Date(local).toISOString();
}
function defaultLocal(): string {
  const d = new Date(Date.now() + 24 * 3600 * 1000);
  d.setMinutes(0, 0, 0);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function RecordatorioFormModal({
  open,
  onClose,
  casos,
  recordatorio,
  defaultCasoId,
}: {
  open: boolean;
  onClose: () => void;
  casos: Pick<Caso, "id" | "titulo">[];
  recordatorio?: Recordatorio;
  defaultCasoId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(recordatorio);
  const [titulo, setTitulo] = useState(recordatorio?.titulo ?? "");
  const [fechaLocal, setFechaLocal] = useState(recordatorio ? isoToLocal(recordatorio.fecha) : defaultLocal());
  const [casoId, setCasoId] = useState(recordatorio?.caso_id ?? defaultCasoId ?? "");
  const [nota, setNota] = useState(recordatorio?.nota ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!titulo.trim()) return setError("El título es obligatorio.");
    if (!fechaLocal) return setError("La fecha es obligatoria.");
    const input: RecordatorioInput = { titulo, fecha: localToISO(fechaLocal), caso_id: casoId || null, nota: nota || null };
    setLoading(true);
    const res = isEdit ? await actualizarRecordatorio(recordatorio!.id, input) : await crearRecordatorio(input);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={isEdit ? "Editar recordatorio" : "Nuevo recordatorio"}
      title={isEdit ? recordatorio!.titulo : "Crear recordatorio"}
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PremiumButton variant="ghost" onClick={onClose} type="button">Cancelar</PremiumButton>
          <PremiumButton variant="gold" type="submit" form="rec-form" loading={loading}>{isEdit ? "Guardar" : "Crear"}</PremiumButton>
        </div>
      }
    >
      <form id="rec-form" onSubmit={onSubmit} className="space-y-4">
        <Field label="Título" htmlFor="titulo" required>
          <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Vence plazo de conclusiones" autoFocus />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha y hora" htmlFor="fecha" required>
            <Input id="fecha" type="datetime-local" value={fechaLocal} onChange={(e) => setFechaLocal(e.target.value)} />
          </Field>
          <Field label="Caso (opcional)" htmlFor="caso">
            <Select id="caso" value={casoId} onChange={(e) => setCasoId(e.target.value)} disabled={Boolean(defaultCasoId)}>
              <option value="">— Sin caso —</option>
              {casos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Nota" htmlFor="nota">
          <Textarea id="nota" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Detalle o recordatorio adicional…" />
        </Field>
        {error && <p className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">{error}</p>}
      </form>
    </Modal>
  );
}
