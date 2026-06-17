import type { ReactNode } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import { DetailProvider } from "@/components/ui/detail-modal";
import { requireActiveUser } from "@/lib/auth";

/**
 * Shell principal de la aplicación (tras iniciar sesión).
 * requireActiveUser() valida EN SERVIDOR la sesión y el acceso vigente:
 * sin sesión → /login, vencido/inactivo → /acceso-expirado. No se puede saltar.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const perfil = await requireActiveUser();
  const isAdmin = perfil.rol === "admin";

  return (
    <div className="relative min-h-dvh">
      <AuroraBackground interactive />
      <Sidebar isAdmin={isAdmin} />

      {/* Empuje para dejar espacio al sidebar en escritorio */}
      <div className="lg:pl-72">
        <Header username={perfil.username} rol={perfil.rol} isAdmin={isAdmin} />
        <DetailProvider>
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </DetailProvider>
      </div>
    </div>
  );
}
