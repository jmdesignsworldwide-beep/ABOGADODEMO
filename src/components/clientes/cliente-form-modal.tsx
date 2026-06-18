"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PremiumButton } from "@/components/ui/premium-button";
import { createCliente, updateCliente } from "@/app/(app)/clientes/actions";
import {
  CLIENTE_TIPO_LABEL,
  TIPO_DOCUMENTO_LABEL,
  type Cliente,
  type ClienteInput,
  type ClienteTipo,
  type TipoDocumento,
} from "@/lib/db/types";

function emptyForm(): ClienteInput {
  return {
    nombre: "",
    tipo: "persona",
    tipo_documento: "cedula",
    documento: "",
    email: "",
    telefono: "",
    direccion: "",
    notas: "",
  };
}

export function ClienteFormModal({
  open,
  onClose,
  cliente,
}: {
  open: boolean;
  onClose: () => void;
  /** Si viene, es edición; si no, creación. */
  cliente?: Cliente;
}) {
  const router = useRouter();
  const isEdit = Boolean(cliente);
  const [form, setForm] = useState<ClienteInput>(
    cliente
      ? {
          nombre: cliente.nombre,
          tipo: cliente.tipo,
          tipo_documento: cliente.tipo_documento,
          documento: cliente.documento ?? "",
          email: cliente.email ?? "",
          telefono: cliente.telefono ?? "",
          direccion: cliente.direccion ?? "",
          notas: cliente.notas ?? "",
        }
      : emptyForm(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ClienteInput>(key: K, value: ClienteInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setLoading(true);
    const res = isEdit
      ? await updateCliente(cliente!.id, form)
      : await createCliente(form);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={isEdit ? "Editar cliente" : "Nuevo cliente"}
      title={isEdit ? cliente!.nombre : "Registrar cliente"}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PremiumButton variant="ghost" onClick={onClose} type="button">
            Cancelar
          </PremiumButton>
          <PremiumButton variant="gold" type="submit" form="cliente-form" loading={loading}>
            {isEdit ? "Guardar cambios" : "Crear cliente"}
          </PremiumButton>
        </div>
      }
    >
      <form id="cliente-form" onSubmit={onSubmit} className="space-y-4">
        <Field label="Nombre o razón social" htmlFor="nombre" required>
          <Input
            id="nombre"
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            placeholder="Ej. María Altagracia Sánchez"
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo de cliente" htmlFor="tipo">
            <Select
              id="tipo"
              value={form.tipo}
              onChange={(e) => set("tipo", e.target.value as ClienteTipo)}
            >
              {Object.entries(CLIENTE_TIPO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Tipo de documento" htmlFor="tipo_documento">
            <Select
              id="tipo_documento"
              value={form.tipo_documento}
              onChange={(e) => set("tipo_documento", e.target.value as TipoDocumento)}
            >
              {Object.entries(TIPO_DOCUMENTO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Documento"
            htmlFor="documento"
            hint={form.tipo_documento === "rnc" ? "Ej. 1-30-12345-6" : "Ej. 001-1234567-8"}
          >
            <Input
              id="documento"
              value={form.documento ?? ""}
              onChange={(e) => set("documento", e.target.value)}
              placeholder={form.tipo_documento === "rnc" ? "1-30-12345-6" : "001-1234567-8"}
            />
          </Field>

          <Field label="Teléfono" htmlFor="telefono" hint="809 / 829 / 849">
            <Input
              id="telefono"
              value={form.telefono ?? ""}
              onChange={(e) => set("telefono", e.target.value)}
              placeholder="(809) 555-1234"
              inputMode="tel"
            />
          </Field>
        </div>

        <Field label="Correo electrónico" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            placeholder="cliente@correo.com"
            inputMode="email"
          />
        </Field>

        <Field label="Dirección" htmlFor="direccion">
          <Input
            id="direccion"
            value={form.direccion ?? ""}
            onChange={(e) => set("direccion", e.target.value)}
            placeholder="Calle, sector, ciudad"
          />
        </Field>

        <Field label="Notas" htmlFor="notas">
          <Textarea
            id="notas"
            value={form.notas ?? ""}
            onChange={(e) => set("notas", e.target.value)}
            placeholder="Información relevante del cliente…"
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
