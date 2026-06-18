import { requireAdmin } from "@/lib/auth";
import { RolesView } from "@/components/roles/roles-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Roles y permisos · JM Design" };

export default async function RolesPage() {
  await requireAdmin();
  return <RolesView />;
}
