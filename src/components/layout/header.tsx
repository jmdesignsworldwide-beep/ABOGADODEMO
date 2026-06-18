import { ShieldCheck, User } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { initials } from "@/components/ui/avatar";

/**
 * Header superior. En móvil muestra el botón hamburguesa; a la derecha,
 * el toggle de tema y la identidad del usuario (usuario + rol reales).
 */
export function Header({
  username,
  rol,
  isAdmin = false,
}: {
  username: string;
  rol: "admin" | "cliente";
  isAdmin?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <MobileNav isAdmin={isAdmin} />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <div className="flex items-center gap-2.5 rounded-xl glass py-1.5 pl-1.5 pr-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy font-display text-sm font-semibold text-gold">
            {initials(username)}
          </span>
          <span className="leading-tight">
            <span className="block max-w-[10rem] truncate text-sm font-medium text-foreground">{username}</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {rol === "admin" ? <ShieldCheck className="h-3 w-3 text-gold" /> : <User className="h-3 w-3" />}
              {rol === "admin" ? "Administrador" : "Cliente"}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
