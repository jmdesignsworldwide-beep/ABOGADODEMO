import { notFound } from "next/navigation";
import { getCasoById } from "@/lib/db/casos";
import { getClientesMin } from "@/lib/db/clientes";
import { getAgendaByCaso } from "@/lib/db/agenda";
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
  const [clientes, audiencias] = await Promise.all([getClientesMin(), getAgendaByCaso(id)]);
  return (
    <CasoDetalle
      caso={caso}
      clientes={clientes}
      audiencias={audiencias}
      nowISO={new Date().toISOString()}
    />
  );
}
