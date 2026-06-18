"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PremiumButton } from "@/components/ui/premium-button";
import { createAudiencia, updateAudiencia } from "@/app/(app)/agenda/actions";
import {
  AUDIENCIA_ESTADO_LABEL,
  AUDIENCIA_TIPO_LABEL,
  type Audiencia,
  type AudienciaEstado,
  type AudienciaInput,
  type AudienciaTipo,
  type Caso,
} from "@/lib/db/types";

type CasoOpt = Pick<Caso, "id" | "titulo">;

function emptyForm(casoId = ""): AudienciaInput {
  return {
    caso_id: casoId,
    tipo: "audiencia",
    titulo: "",
    fecha: "",
    hora: "",
    lugar: "",
    estado: "programada",
    notas: "",
  };
}

export function AudienciaFormModal({
  open,
  onClose,
  casos,
  audiencia,
  defaultCasoId,
}: {
  open: boolean;
  onClose: () => void;
  casos: CasoOpt[];
  audiencia?: Audiencia;
  defaultCasoId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(audiencia);
  const [form, setForm] = useState<AudienciaInput>(
    audiencia
      ? {
          caso_id: audiencia.caso_id,
          tipo: audiencia.tipo,
          titulo: audiencia.titulo,
          fecha: audiencia.fecha,
          hora: audiencia.hora ? audiencia.hora.slice(0, 5) : "",
          lugar: audiencia.lugar ?? "",
          estado: audiencia.estado,
          notas: audiencia.notas ?? "",
        }
      : emptyForm(defaultCasoId),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof AudienciaInput>(key: K, value: AudienciaInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.titulo.trim()) return setError("El título es obligatorio.");
    if (!form.caso_id) return setError("Debes vincular a un caso.");
    if (!form.fecha) return setError("La fecha es obligatoria.");
    setLoading(true);
    const res = isEdit ? await updateAudiencia(audiencia!.id, form) : await createAudiencia(form);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={isEdit ? "Editar" : "Nueva en agenda"}
      title={isEdit ? audiencia!.titulo : "Audiencia o cita"}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PremiumButton variant="ghost" onClick={onClose} type="button">
            Cancelar
          </PremiumButton>
          <PremiumButton variant="gold" type="submit" form="agenda-form" loading={loading}>
            {isEdit ? "Guardar cambios" : "Agendar"}
          </PremiumButton>
        </div>
      }
    >
      <form id="agenda-form" onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo" htmlFor="tipo">
            <Select id="tipo" value={form.tipo} onChange={(e) => set("tipo", e.target.value as AudienciaTipo)}>
              {Object.entries(AUDIENCIA_TIPO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </Field>
          <Field label="Estado" htmlFor="estado">
            <Select id="estado" value={form.estado} onChange={(e) => set("estado", e.target.value as AudienciaEstado)}>
              {Object.entries(AUDIENCIA_ESTADO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Título" htmlFor="titulo" required>
          <Input
            id="titulo"
            value={form.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            placeholder="Ej. Audiencia de fondo — producción de pruebas"
            autoFocus
          />
        </Field>

        <Field label="Caso vinculado" htmlFor="caso_id" required>
          <Select
            id="caso_id"
            value={form.caso_id}
            onChange={(e) => set("caso_id", e.target.value)}
            disabled={Boolean(defaultCasoId) && !isEdit}
          >
            <option value="" disabled>Selecciona un caso…</option>
            {casos.map((c) => (
              <option key={c.id} value={c.id}>{c.titulo}</option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha" htmlFor="fecha" required>
            <Input id="fecha" type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
          </Field>
          <Field label="Hora" htmlFor="hora">
            <Input id="hora" type="time" value={form.hora ?? ""} onChange={(e) => set("hora", e.target.value)} />
          </Field>
        </div>

        <Field label="Lugar / Tribunal" htmlFor="lugar">
          <Input
            id="lugar"
            value={form.lugar ?? ""}
            onChange={(e) => set("lugar", e.target.value)}
            placeholder="Ej. Juzgado de Primera Instancia, 3ª Sala Civil, D.N."
          />
        </Field>

        <Field label="Notas" htmlFor="notas">
          <Textarea
            id="notas"
            value={form.notas ?? ""}
            onChange={(e) => set("notas", e.target.value)}
            placeholder="Recordatorios, documentos a llevar…"
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">{error}</p>
        )}
      </form>
    </Modal>
  );
}
