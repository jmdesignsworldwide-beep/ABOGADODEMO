import { getFacturas } from "@/lib/db/facturas";
import { getClientesMin } from "@/lib/db/clientes";
import { getCasosMin } from "@/lib/db/casos";
import { FacturasView } from "@/components/facturacion/facturas-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Facturación · JM Design — Gestión Legal" };

export default async function FacturacionPage() {
  const [facturas, clientes, casos] = await Promise.all([
    getFacturas(),
    getClientesMin(),
    getCasosMin(),
  ]);
  return <FacturasView facturas={facturas} clientes={clientes} casos={casos} />;
}
