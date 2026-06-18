"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Scale,
  StickyNote,
  Trash2,
  User,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PremiumButton } from "@/components/ui/premium-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ClienteFormModal } from "./cliente-form-modal";
import { DocumentosSection } from "@/components/documentos/documentos-section";
import { ResumenFinanciero } from "./resumen-financiero";
import { ContratosSection } from "@/components/contratos/contratos-section";
import type { FacturaResumen } from "@/lib/db/facturas";
import { deleteCliente } from "@/app/(app)/clientes/actions";
import type { ClienteFicha as Ficha } from "@/lib/db/clientes";
import {
  CASO_ESTADO_LABEL,
  CASO_ESTADO_STYLE,
  CASO_TIPO_LABEL,
  CLIENTE_TIPO_LABEL,
  type ContratoConVinculos,
  type DocumentoConVinculos,
} from "@/lib/db/types";

export function ClienteFicha({ ficha, documentos, facturas, contratos }: { ficha: Ficha; documentos: DocumentoConVinculos[]; facturas: FacturaResumen[]; contratos: ContratoConVinculos[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const contacto = [
    { icon: FileText, label: "Documento", value: ficha.documento },
    { icon: Phone, label: "Teléfono", value: ficha.telefono },
    { icon: Mail, label: "Correo", value: ficha.email },
    { icon: MapPin, label: "Dirección", value: ficha.direccion },
  ].filter((r) => r.value);

  return (
    <div className="space-y-6">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Clientes
      </Link>

      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar nombre={ficha.nombre} size="lg" />
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {ficha.nombre}
            </h2>
            <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              {ficha.tipo === "empresa" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
              {CLIENTE_TIPO_LABEL[ficha.tipo]}
            </span>
          </div>
        </div>
        <div className="flex gap-2.5">
          <PremiumButton variant="outline" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditing(true)}>
            Editar
          </PremiumButton>
          <PremiumButton variant="ghost" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleting(true)}>
            Eliminar
          </PremiumButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Datos de contacto */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-2xl glass p-5 shadow-layered">
            <h3 className="font-display text-lg font-semibold text-foreground">Datos de contacto</h3>
            <dl className="mt-4 space-y-3.5">
              {contacto.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin datos de contacto registrados.</p>
              )}
              {contacto.map((r) => (
                <div key={r.label} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <r.icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {r.label}
                    </dt>
                    <dd className="break-words text-sm text-foreground">{r.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <ResumenFinanciero facturas={facturas} />

          {ficha.notas && (
            <div className="rounded-2xl glass p-5 shadow-layered">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <StickyNote className="h-4 w-4 text-gold" /> Notas
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{ficha.notas}</p>
            </div>
          )}

          <DocumentosSection documentos={documentos} clienteId={ficha.id} contextoLabel="este cliente" />

          <ContratosSection contratos={contratos} generarHref={`/contratos?nuevo=1&cliente=${ficha.id}`} />
        </div>

        {/* Casos del cliente */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Scale className="h-5 w-5 text-gold" />
              Casos ({ficha.casos.length})
            </h3>
          </div>

          {ficha.casos.length === 0 ? (
            <EmptyState
              icon={Scale}
              title="Sin casos registrados"
              description="Este cliente todavía no tiene casos. Podrás crearlos desde el módulo de Casos."
            />
          ) : (
            <Stagger className="space-y-3">
              {ficha.casos.map((caso) => (
                <StaggerItem key={caso.id}>
                  <Link
                    href={`/casos/${caso.id}`}
                    className="block w-full rounded-2xl glass p-5 text-left shadow-layered transition-shadow duration-300 hover:glow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-display text-base font-semibold text-foreground">{caso.titulo}</h4>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CASO_ESTADO_STYLE[caso.estado]}`}>
                        {CASO_ESTADO_LABEL[caso.estado]}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium">{CASO_TIPO_LABEL[caso.tipo]}</span>
                      {caso.abogado && <span>{caso.abogado}</span>}
                      {caso.expediente && <span className="tabular">{caso.expediente.numero}</span>}
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={caso.avance} showValue label="Avance" />
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>

      {/* Modales */}
      {editing && <ClienteFormModal open onClose={() => setEditing(false)} cliente={ficha} />}
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title={`Eliminar a ${ficha.nombre}`}
        description="Se eliminarán también sus casos y expedientes vinculados. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          const res = await deleteCliente(ficha.id);
          if (res.ok) router.push("/clientes");
          return res;
        }}
      />
    </div>
  );
}
