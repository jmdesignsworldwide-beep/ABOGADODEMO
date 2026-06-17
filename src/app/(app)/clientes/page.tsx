import { getClientes } from "@/lib/db/clientes";
import { ClientesView } from "@/components/clientes/clientes-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clientes · JM Design — Gestión Legal" };

export default async function ClientesPage() {
  const clientes = await getClientes();
  return <ClientesView clientes={clientes} />;
}
