import { notFound } from "next/navigation";
import { getFacturaById } from "@/lib/db/facturas";
import { FacturaDetalle } from "@/components/facturacion/factura-detalle";

export const dynamic = "force-dynamic";

export default async function FacturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const factura = await getFacturaById(id);
  if (!factura) notFound();
  return <FacturaDetalle factura={factura} />;
}
