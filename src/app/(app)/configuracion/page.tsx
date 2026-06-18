import { requireAdmin } from "@/lib/auth";
import { getPerfiles } from "@/lib/db/perfiles";
import { UsuariosView } from "@/components/configuracion/usuarios-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gestión de usuarios · JM Design" };

export default async function ConfiguracionPage() {
  const admin = await requireAdmin(); // bloquea a clientes (incluso por URL directa)
  const perfiles = await getPerfiles();
  return <UsuariosView perfiles={perfiles} adminId={admin.id} />;
}
