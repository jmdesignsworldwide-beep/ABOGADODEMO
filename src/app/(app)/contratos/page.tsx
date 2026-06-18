import { getContratos, getGeneradorData } from "@/lib/db/contratos";
import { ContratosView } from "@/components/contratos/contratos-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Documentos / Contratos · JM Design — Gestión Legal" };

export default async function ContratosPage() {
  const [contratos, generador] = await Promise.all([getContratos(), getGeneradorData()]);
  return <ContratosView contratos={contratos} clientes={generador.clientes} casos={generador.casos} />;
}
