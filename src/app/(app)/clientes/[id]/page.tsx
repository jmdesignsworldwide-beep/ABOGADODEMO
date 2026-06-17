import { notFound } from "next/navigation";
import { getClienteById } from "@/lib/db/clientes";
import { getDocumentosByCliente } from "@/lib/db/documentos";
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
  const documentos = await getDocumentosByCliente(id);
  return <ClienteFicha ficha={ficha} documentos={documentos} />;
}
