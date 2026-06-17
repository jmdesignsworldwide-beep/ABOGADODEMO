import { notFound } from "next/navigation";
import { getClienteById } from "@/lib/db/clientes";
import { ClienteFicha } from "@/components/clientes/cliente-ficha";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ficha = await getClienteById(id);
  if (!ficha) notFound();
  return <ClienteFicha ficha={ficha} />;
}
