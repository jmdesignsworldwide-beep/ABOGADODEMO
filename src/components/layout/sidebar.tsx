import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NavLinks } from "./nav-links";

/**
 * Sidebar de escritorio (oculto en móvil; ahí se usa el menú hamburguesa).
 * Cristal fijo a la izquierda con logo, navegación y pie de sesión.
 */
export function Sidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-72 lg:flex-col">
      <div className="m-3 flex flex-1 flex-col rounded-2xl glass shadow-layered">
        <div className="px-5 pb-4 pt-6">
          <Logo size="md" />
        </div>
        <div className="mx-4 h-px rule-gold opacity-50" />

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks layoutId="nav-active-desktop" />
        </div>

        <div className="mx-4 h-px bg-border" />
        <div className="p-3">
          <Link
            href="/login"
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Cerrar sesión
          </Link>
        </div>
      </div>
    </aside>
  );
}
