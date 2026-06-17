import { getDocumentos } from "@/lib/db/documentos";
import { getCasosMin } from "@/lib/db/casos";
import { getClientesMin } from "@/lib/db/clientes";
import { DocumentosView } from "@/components/documentos/documentos-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Documentos · JM Design — Gestión Legal" };

export default async function DocumentosPage() {
  const [documentos, casos, clientes] = await Promise.all([
    getDocumentos(),
    getCasosMin(),
    getClientesMin(),
  ]);
  return <DocumentosView documentos={documentos} casos={casos} clientes={clientes} />;
}
