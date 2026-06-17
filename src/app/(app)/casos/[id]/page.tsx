import { notFound } from "next/navigation";
import { getCasoById } from "@/lib/db/casos";
import { getClientesMin } from "@/lib/db/clientes";
import { CasoDetalle } from "@/components/casos/caso-detalle";

export const dynamic = "force-dynamic";

export default async function CasoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [caso, clientes] = await Promise.all([getCasoById(id), getClientesMin()]);
  if (!caso) notFound();
  return <CasoDetalle caso={caso} clientes={clientes} />;
}
