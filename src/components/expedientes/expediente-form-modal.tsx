"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/field";
import { PremiumButton } from "@/components/ui/premium-button";
import { createExpediente, updateExpediente } from "@/app/(app)/expedientes/actions";
import type { Caso, Expediente, ExpedienteInput } from "@/lib/db/types";

type CasoOpt = Pick<Caso, "id" | "titulo">;

const ESTADOS_PROCESALES = [
  "En instrucción",
  "Producción de pruebas",
  "Conclusiones",
  "Audiencia de fondo",
  "Conciliación",
  "Fallo reservado",
  "Sentencia firme",
  "En apelación",
  "En registro",
  "Suspendido",
  "Archivado",
];

function emptyForm(casoId = ""): ExpedienteInput {
  return { caso_id: casoId, numero: "", tribunal: "", juez: "", estado_procesal: "" };
}

export function ExpedienteFormModal({
  open,
  onClose,
  casos,
  expediente,
  defaultCasoId,
}: {
  open: boolean;
  onClose: () => void;
  /** Casos disponibles (sin expediente, + el actual si es edición). */
  casos: CasoOpt[];
  expediente?: Expediente;
  defaultCasoId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(expediente);
  const [form, setForm] = useState<ExpedienteInput>(
    expediente
      ? {
          caso_id: expediente.caso_id,
          numero: expediente.numero,
          tribunal: expediente.tribunal ?? "",
          juez: expediente.juez ?? "",
          estado_procesal: expediente.estado_procesal ?? "",
        }
      : emptyForm(defaultCasoId),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ExpedienteInput>(key: K, value: ExpedienteInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.numero.trim()) return setError("El número de expediente es obligatorio.");
    if (!form.caso_id) return setError("Debes vincular el expediente a un caso.");
    setLoading(true);
    const res = isEdit ? await updateExpediente(expediente!.id, form) : await createExpediente(form);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
    onClose();
  }

  const noHayCasos = casos.length === 0 && !isEdit;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={isEdit ? "Editar expediente" : "Nuevo expediente"}
      title={isEdit ? expediente!.numero : "Registrar expediente"}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PremiumButton variant="ghost" onClick={onClose} type="button">
            Cancelar
          </PremiumButton>
          <PremiumButton variant="gold" type="submit" form="exp-form" loading={loading} disabled={noHayCasos}>
            {isEdit ? "Guardar cambios" : "Crear expediente"}
          </PremiumButton>
        </div>
      }
    >
      <form id="exp-form" onSubmit={onSubmit} className="space-y-4">
        {noHayCasos && (
          <p className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">
            Todos los casos ya tienen expediente. Crea un caso nuevo primero.
          </p>
        )}

        <Field label="Número de expediente" htmlFor="numero" required hint="Ej. Exp. 034-2026-CIV-00412">
          <Input
            id="numero"
            value={form.numero}
            onChange={(e) => set("numero", e.target.value)}
            placeholder="Exp. 000-2026-XXX-00000"
            autoFocus
            className="tabular"
          />
        </Field>

        <Field label="Caso vinculado" htmlFor="caso_id" required>
          <Select
            id="caso_id"
            value={form.caso_id}
            onChange={(e) => set("caso_id", e.target.value)}
            disabled={Boolean(defaultCasoId) && !isEdit}
          >
            <option value="" disabled>
              Selecciona un caso…
            </option>
            {casos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tribunal" htmlFor="tribunal" hint="Tribunal o entidad donde se tramita">
          <Input
            id="tribunal"
            value={form.tribunal ?? ""}
            onChange={(e) => set("tribunal", e.target.value)}
            placeholder="Ej. Juzgado de Primera Instancia, 3ª Sala Civil, D.N."
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Juez" htmlFor="juez">
            <Input
              id="juez"
              value={form.juez ?? ""}
              onChange={(e) => set("juez", e.target.value)}
              placeholder="Ej. Mag. Francisco Ortega"
            />
          </Field>

          <Field label="Estado procesal" htmlFor="estado_procesal">
            <Input
              id="estado_procesal"
              value={form.estado_procesal ?? ""}
              onChange={(e) => set("estado_procesal", e.target.value)}
              placeholder="Ej. Producción de pruebas"
              list="estados-procesales"
            />
            <datalist id="estados-procesales">
              {ESTADOS_PROCESALES.map((e) => (
                <option key={e} value={e} />
              ))}
            </datalist>
          </Field>
        </div>

        {error && (
          <p className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">{error}</p>
        )}
      </form>
    </Modal>
  );
}
