import { getDashboard } from "@/lib/db/dashboard";
import { getCasosMin } from "@/lib/db/casos";
import { PanelClient } from "@/components/dashboard/panel-client";

export const dynamic = "force-dynamic";

/**
 * Dashboard (Panel) — datos reales de Supabase. El diseño y las animaciones
 * (count-up, barras, latido de urgencia) se mantienen; solo cambia el origen
 * de los datos.
 */
export default async function PanelPage() {
  const [data, casos] = await Promise.all([getDashboard(), getCasosMin()]);
  return <PanelClient {...data} casos={casos} nowISO={new Date().toISOString()} />;
}
