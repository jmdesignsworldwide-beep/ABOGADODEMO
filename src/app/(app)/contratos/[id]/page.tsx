import { notFound } from "next/navigation";
import { getContratoById } from "@/lib/db/contratos";
import { ContratoDetalle } from "@/components/contratos/contrato-detalle";

export const dynamic = "force-dynamic";

export default async function ContratoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contrato = await getContratoById(id);
  if (!contrato) notFound();
  return <ContratoDetalle contrato={contrato} />;
}
