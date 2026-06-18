import { getRecordatorios } from "@/lib/db/recordatorios";
import { getCasosMin } from "@/lib/db/casos";
import { RecordatoriosView } from "@/components/recordatorios/recordatorios-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recordatorios · JM Design — Gestión Legal" };

export default async function RecordatoriosPage() {
  const [recordatorios, casos] = await Promise.all([getRecordatorios(), getCasosMin()]);
  return <RecordatoriosView recordatorios={recordatorios} casos={casos} nowISO={new Date().toISOString()} />;
}
