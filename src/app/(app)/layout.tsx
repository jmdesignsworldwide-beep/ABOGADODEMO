import type { ReactNode } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import { DetailProvider } from "@/components/ui/detail-modal";

/**
 * Shell principal de la aplicación (tras iniciar sesión):
 *  - Aurora de fondo
 *  - Sidebar fijo en escritorio / hamburguesa en móvil
 *  - Header con toggle de tema y usuario
 *  - Área de contenido con transición entre vistas
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <AuroraBackground interactive />
      <Sidebar />

      {/* Empuje para dejar espacio al sidebar en escritorio */}
      <div className="lg:pl-72">
        <Header />
        <DetailProvider>
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </DetailProvider>
      </div>
    </div>
  );
}
