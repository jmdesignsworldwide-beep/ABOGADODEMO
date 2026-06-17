import { ChevronDown } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Header superior. En móvil muestra el botón hamburguesa; en escritorio,
 * el título de la vista. A la derecha: toggle de tema + usuario.
 */
export function Header({
  title = "Panel",
  userName = "Lic. J. Martínez",
  userRole = "Socio principal",
}: {
  title?: string;
  userName?: string;
  userRole?: string;
}) {
  const initials = userName
    .replace(/^(Lic\.|Dr\.|Dra\.)\s*/i, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <MobileNav />

      <div className="hidden min-w-0 lg:block">
        <h1 className="truncate font-display text-xl font-semibold text-foreground">
          {title}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl glass py-1.5 pl-1.5 pr-2.5 text-left transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy font-display text-sm font-semibold text-gold">
            {initials}
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-medium text-foreground">{userName}</span>
            <span className="block text-[11px] text-muted-foreground">{userRole}</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </button>
      </div>
    </header>
  );
}
