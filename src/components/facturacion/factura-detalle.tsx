"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BadgeCheck, Ban, Download, Scale, Trash2, User } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { descargarFacturaPDF } from "@/lib/factura-pdf";
import { formatRD, fechaLargaRD } from "@/lib/facturas";
import { cambiarEstadoFactura, deleteFactura } from "@/app/(app)/facturacion/actions";
import {
  FACTURA_ESTADO_LABEL,
  FACTURA_ESTADO_STYLE,
  TIPO_NCF_LABEL,
  type FacturaConVinculos,
} from "@/lib/db/types";

export function FacturaDetalle({ factura }: { factura: FacturaConVinculos }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  async function cambiar(estado: "pagada" | "anulada" | "pendiente") {
    setBusy(true);
    await cambiarEstadoFactura(factura.id, estado);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Link href="/facturacion" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Facturación
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h2 className="font-display text-2xl font-semibold tabular text-foreground sm:text-3xl">{factura.numero}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${FACTURA_ESTADO_STYLE[factura.estado]}`}>
              {FACTURA_ESTADO_LABEL[factura.estado]}
            </span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">{TIPO_NCF_LABEL[factura.tipo_ncf]}</span>
            <span className="text-xs text-muted-foreground">{fechaLargaRD(factura.fecha)}</span>
          </div>
        </div>
        <PremiumButton variant="gold" leftIcon={<Download className="h-4 w-4" />} onClick={() => descargarFacturaPDF(factura)}>
          Descargar PDF
        </PremiumButton>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Conceptos + desglose */}
        <div className="space-y-4 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl glass shadow-layered">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Descripción</th>
                  <th className="px-3 py-3 text-center font-medium">Cant.</th>
                  <th className="px-5 py-3 text-right font-medium">Importe</th>
                </tr>
              </thead>
              <tbody>
                {factura.conceptos.map((c, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-foreground">{c.descripcion}</td>
                    <td className="px-3 py-3 text-center tabular text-muted-foreground">{c.cantidad}</td>
                    <td className="px-5 py-3 text-right tabular text-foreground">{formatRD(c.cantidad * c.precio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1.5 border-t border-border bg-muted/40 px-5 py-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular text-foreground">{formatRD(Number(factura.subtotal))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ITBIS (18%)</span><span className="tabular text-foreground">{formatRD(Number(factura.itbis))}</span></div>
              <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold"><span className="text-foreground">Total</span><span className="tabular text-gold">{formatRD(Number(factura.total))}</span></div>
            </div>
          </div>

          {/* Acciones de estado */}
          <div className="flex flex-wrap gap-2.5">
            {factura.estado !== "pagada" && (
              <PremiumButton variant="outline" loading={busy} leftIcon={<BadgeCheck className="h-4 w-4" />} onClick={() => cambiar("pagada")}>
                Marcar pagada
              </PremiumButton>
            )}
            {factura.estado !== "anulada" && (
              <PremiumButton variant="ghost" loading={busy} leftIcon={<Ban className="h-4 w-4" />} onClick={() => cambiar("anulada")}>
                Anular
              </PremiumButton>
            )}
            {factura.estado === "anulada" && (
              <PremiumButton variant="ghost" loading={busy} onClick={() => cambiar("pendiente")}>
                Reactivar (pendiente)
              </PremiumButton>
            )}
            <PremiumButton variant="ghost" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setEliminando(true)}>
              Eliminar
            </PremiumButton>
          </div>
        </div>

        {/* Cliente / caso */}
        <div className="space-y-4">
          <div className="rounded-2xl glass p-5 shadow-layered">
            <h3 className="font-display text-lg font-semibold text-foreground">Cliente</h3>
            {factura.cliente ? (
              <Link href={`/clientes/${factura.cliente.id}`} className="group mt-3 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy text-sm font-semibold text-gold-on-navy"><User className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{factura.cliente.nombre}</p>
                  {factura.cliente.documento && <p className="truncate text-xs tabular text-muted-foreground">{(factura.cliente.tipo_documento ?? "").toUpperCase()}: {factura.cliente.documento}</p>}
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ) : <p className="mt-3 text-sm text-muted-foreground">Sin cliente.</p>}
          </div>

          {factura.caso && (
            <div className="rounded-2xl glass p-5 shadow-layered">
              <h3 className="font-display text-lg font-semibold text-foreground">Caso vinculado</h3>
              <Link href={`/casos/${factura.caso.id}`} className="group mt-3 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold"><Scale className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{factura.caso.titulo}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={eliminando}
        onClose={() => setEliminando(false)}
        title={`Eliminar factura ${factura.numero}`}
        description="Se eliminará la factura por completo. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        onConfirm={async () => {
          const res = await deleteFactura(factura.id);
          if (res.ok) router.push("/facturacion");
          return res;
        }}
      />
    </div>
  );
}
