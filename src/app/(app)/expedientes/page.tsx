import { getCasosSinExpediente, getExpedientes } from "@/lib/db/expedientes";
import { ExpedientesView } from "@/components/expedientes/expedientes-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Expedientes · JM Design — Gestión Legal" };

export default async function ExpedientesPage() {
  const [expedientes, casosSinExpediente] = await Promise.all([
    getExpedientes(),
    getCasosSinExpediente(),
  ]);
  return <ExpedientesView expedientes={expedientes} casosSinExpediente={casosSinExpediente} />;
}
