"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, type NavItem } from "@/lib/nav";

const ADMIN_ITEM: NavItem = { label: "Gestión de usuarios", href: "/configuracion", icon: Settings };

/**
 * Lista de enlaces de navegación con indicador de activo animado
 * (pill deslizante con layoutId compartido). Reutilizada por el sidebar
 * de escritorio y el menú móvil. "Gestión de usuarios" solo se muestra a admin.
 */
export function NavLinks({
  onNavigate,
  layoutId = "nav-active",
  isAdmin = false,
}: {
  onNavigate?: () => void;
  layoutId?: string;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const items = isAdmin ? [...navItems, ADMIN_ITEM] : navItems;

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        const disabled = item.soon;

        const content = (
          <>
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-xl bg-[color-mix(in_srgb,var(--navy)_16%,transparent)] ring-1 ring-[var(--gold)]/25"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors",
                active ? "text-gold" : "text-muted-foreground group-hover:text-foreground",
              )}
              strokeWidth={1.75}
            />
            <span
              className={cn(
                "truncate transition-colors",
                active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
              )}
            >
              {item.label}
            </span>
            {disabled && (
              <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                pronto
              </span>
            )}
          </>
        );

        const cls =
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium";

        if (disabled) {
          return (
            <span
              key={item.href}
              aria-disabled
              className={cn(cls, "cursor-not-allowed opacity-60")}
            >
              {content}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              cls,
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              !active && "hover:bg-muted/60",
            )}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
