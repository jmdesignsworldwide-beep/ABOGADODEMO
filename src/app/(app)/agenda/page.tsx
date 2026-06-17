import { getAgenda } from "@/lib/db/agenda";
import { getCasosMin } from "@/lib/db/casos";
import { AgendaView } from "@/components/agenda/agenda-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agenda · JM Design — Gestión Legal" };

export default async function AgendaPage() {
  const [audiencias, casos] = await Promise.all([getAgenda(), getCasosMin()]);
  return <AgendaView audiencias={audiencias} casos={casos} nowISO={new Date().toISOString()} />;
}
