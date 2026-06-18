import { getCasos } from "@/lib/db/casos";
import { getClientesMin } from "@/lib/db/clientes";
import { CasosView } from "@/components/casos/casos-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Casos · JM Design — Gestión Legal" };

export default async function CasosPage() {
  const [casos, clientes] = await Promise.all([getCasos(), getClientesMin()]);
  return <CasosView casos={casos} clientes={clientes} />;
}
