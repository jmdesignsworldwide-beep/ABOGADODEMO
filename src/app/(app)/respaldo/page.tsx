import { requireAdmin } from "@/lib/auth";
import { RespaldoView } from "@/components/respaldo/respaldo-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Respaldo en la nube · JM Design" };

export default async function RespaldoPage() {
  await requireAdmin();
  // Último respaldo "reciente" (demostración): hace ~3 horas.
  const d = new Date();
  d.setHours(d.getHours() - 3);
  d.setMinutes(d.getMinutes() - 14);
  return <RespaldoView ultimoISO={d.toISOString()} />;
}
