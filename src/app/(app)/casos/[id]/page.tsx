import { notFound } from "next/navigation";
import { getCasoById } from "@/lib/db/casos";
import { getClientesMin } from "@/lib/db/clientes";
import { getAgendaByCaso } from "@/lib/db/agenda";
import { getDocumentosByCaso } from "@/lib/db/documentos";
import { getContratosByCaso } from "@/lib/db/contratos";
import { CasoDetalle } from "@/components/casos/caso-detalle";

export const dynamic = "force-dynamic";

export default async function CasoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caso = await getCasoById(id);
  if (!caso) notFound();
  const [clientes, audiencias, documentos, contratos] = await Promise.all([
    getClientesMin(),
    getAgendaByCaso(id),
    getDocumentosByCaso(id),
    getContratosByCaso(id),
  ]);
  return (
    <CasoDetalle
      caso={caso}
      clientes={clientes}
      audiencias={audiencias}
      documentos={documentos}
      contratos={contratos}
      nowISO={new Date().toISOString()}
    />
  );
}
