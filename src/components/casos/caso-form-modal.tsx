"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PremiumButton } from "@/components/ui/premium-button";
import { createCaso, updateCaso } from "@/app/(app)/casos/actions";
import {
  CASO_ESTADO_LABEL,
  CASO_TIPO_LABEL,
  type Caso,
  type CasoEstado,
  type CasoInput,
  type CasoTipo,
  type Cliente,
} from "@/lib/db/types";

type ClienteOpt = Pick<Cliente, "id" | "nombre">;

function emptyForm(clienteId = ""): CasoInput {
  return {
    cliente_id: clienteId,
    titulo: "",
    tipo: "civil",
    estado: "abierto",
    abogado: "",
    parte_contraria: "",
    avance: 0,
    descripcion: "",
  };
}

export function CasoFormModal({
  open,
  onClose,
  clientes,
  caso,
  defaultClienteId,
}: {
  open: boolean;
  onClose: () => void;
  clientes: ClienteOpt[];
  caso?: Caso;
  defaultClienteId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(caso);
  const [form, setForm] = useState<CasoInput>(
    caso
      ? {
          cliente_id: caso.cliente_id,
          titulo: caso.titulo,
          tipo: caso.tipo,
          estado: caso.estado,
          abogado: caso.abogado ?? "",
          parte_contraria: caso.parte_contraria ?? "",
          avance: caso.avance,
          descripcion: caso.descripcion ?? "",
        }
      : emptyForm(defaultClienteId),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CasoInput>(key: K, value: CasoInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.titulo.trim()) return setError("El título del caso es obligatorio.");
    if (!form.cliente_id) return setError("Debes seleccionar un cliente.");
    setLoading(true);
    const res = isEdit ? await updateCaso(caso!.id, form) : await createCaso(form);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={isEdit ? "Editar caso" : "Nuevo caso"}
      title={isEdit ? caso!.titulo : "Registrar caso"}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PremiumButton variant="ghost" onClick={onClose} type="button">
            Cancelar
          </PremiumButton>
          <PremiumButton variant="gold" type="submit" form="caso-form" loading={loading}>
            {isEdit ? "Guardar cambios" : "Crear caso"}
          </PremiumButton>
        </div>
      }
    >
      <form id="caso-form" onSubmit={onSubmit} className="space-y-4">
        <Field label="Título del caso" htmlFor="titulo" required>
          <Input
            id="titulo"
            value={form.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            placeholder="Ej. Sánchez vs. Inmobiliaria del Este"
            autoFocus
          />
        </Field>

        <Field label="Cliente" htmlFor="cliente_id" required>
          <Select
            id="cliente_id"
            value={form.cliente_id}
            onChange={(e) => set("cliente_id", e.target.value)}
            disabled={Boolean(defaultClienteId) && !isEdit}
          >
            <option value="" disabled>
              Selecciona un cliente…
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo de caso" htmlFor="tipo">
            <Select id="tipo" value={form.tipo} onChange={(e) => set("tipo", e.target.value as CasoTipo)}>
              {Object.entries(CASO_TIPO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Estado" htmlFor="estado">
            <Select id="estado" value={form.estado} onChange={(e) => set("estado", e.target.value as CasoEstado)}>
              {Object.entries(CASO_ESTADO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Abogado asignado" htmlFor="abogado">
            <Input
              id="abogado"
              value={form.abogado ?? ""}
              onChange={(e) => set("abogado", e.target.value)}
              placeholder="Ej. Lic. José Martínez"
            />
          </Field>
          <Field label="Parte contraria" htmlFor="parte_contraria">
            <Input
              id="parte_contraria"
              value={form.parte_contraria ?? ""}
              onChange={(e) => set("parte_contraria", e.target.value)}
              placeholder="Ej. Inmobiliaria del Este, S.R.L."
            />
          </Field>
        </div>

        <Field label="Avance" htmlFor="avance" hint={`${form.avance}% completado`}>
          <input
            id="avance"
            type="range"
            min={0}
            max={100}
            step={5}
            value={form.avance}
            onChange={(e) => set("avance", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--gold)]"
          />
        </Field>

        <Field label="Descripción" htmlFor="descripcion">
          <Textarea
            id="descripcion"
            value={form.descripcion ?? ""}
            onChange={(e) => set("descripcion", e.target.value)}
            placeholder="Resumen del caso, pretensiones, antecedentes…"
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">{error}</p>
        )}
      </form>
    </Modal>
  );
}
