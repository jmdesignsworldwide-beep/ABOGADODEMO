import { requireAdmin } from "@/lib/auth";
import { getAuditoria } from "@/lib/db/auditoria";
import { AuditoriaView } from "@/components/auditoria/auditoria-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Historial / Auditoría · JM Design" };

export default async function HistorialPage() {
  await requireAdmin(); // solo admin audita
  const entradas = await getAuditoria();
  return <AuditoriaView entradas={entradas} />;
}
