import { Logo } from "@/components/brand/logo";
import { NavLinks } from "./nav-links";
import { LogoutButton } from "@/components/auth/logout-button";

/**
 * Sidebar de escritorio (oculto en móvil; ahí se usa el menú hamburguesa).
 * Cristal fijo a la izquierda con logo, navegación y pie de sesión.
 */
export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-72 lg:flex-col">
      <div className="m-3 flex flex-1 flex-col rounded-2xl glass shadow-layered">
        <div className="px-5 pb-4 pt-6">
          <Logo size="md" />
        </div>
        <div className="mx-4 h-px rule-gold opacity-50" />

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks layoutId="nav-active-desktop" isAdmin={isAdmin} />
        </div>

        <div className="mx-4 h-px bg-border" />
        <div className="p-3">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
