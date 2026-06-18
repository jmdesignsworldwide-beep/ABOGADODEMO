import { getCasos } from "@/lib/db/casos";
import { buildConversations, type ConvLink } from "@/lib/comunicaciones/demo";
import { ComunicacionesView } from "@/components/comunicaciones/comunicaciones-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comunicaciones · JM Design" };

export default async function ComunicacionesPage() {
  // Vinculamos las conversaciones demo a clientes/casos REALES del sistema.
  let links: ConvLink[] = [];
  try {
    const casos = await getCasos();
    links = casos
      .filter((c) => c.cliente?.id)
      .slice(0, 8)
      .map((c) => ({
        clienteId: c.cliente!.id,
        clienteNombre: c.cliente!.nombre,
        casoId: c.id,
        casoTitulo: c.titulo,
      }));
  } catch {
    links = [];
  }

  const conversations = buildConversations(links);
  return <ComunicacionesView conversations={conversations} />;
}
