import { getFinanciero } from "@/lib/db/financiero";
import { FinanzasView } from "@/components/finanzas/finanzas-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Control Financiero · JM Design — Gestión Legal" };

export default async function FinanzasPage() {
  const data = await getFinanciero();
  return <FinanzasView data={data} />;
}
