import { notFound } from "next/navigation";
import { getExpedienteById, getCasosSinExpediente } from "@/lib/db/expedientes";
import { ExpedienteDetalle } from "@/components/expedientes/expediente-detalle";

export const dynamic = "force-dynamic";

export default async function ExpedienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expediente = await getExpedienteById(id);
  if (!expediente) notFound();
  const casosSinExpediente = await getCasosSinExpediente(expediente.caso?.id);
  return <ExpedienteDetalle expediente={expediente} casosSinExpediente={casosSinExpediente} />;
}
