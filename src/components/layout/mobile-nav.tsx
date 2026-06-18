"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NavLinks } from "./nav-links";
import { LogoutButton } from "@/components/auth/logout-button";

/**
 * Menú de navegación móvil: botón hamburguesa + drawer deslizante con overlay.
 * Cuidados anti-rotura:
 *  - Se cierra solo al cambiar de ruta.
 *  - Bloquea el scroll del body mientras está abierto.
 *  - Cierra con tecla Escape.
 *  - Respeta reduced-motion (sin slide, solo fade).
 *  - Solo visible en móvil/tablet (lg:hidden).
 */
export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduced = useReducedMotion();

  // Cerrar al navegar (incluye back/forward del navegador). Sincroniza con un
  // sistema externo (la URL), por eso el setState aquí es correcto.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  // Bloquear scroll + cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl glass text-foreground/80 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navegación"
              initial={reduced ? { opacity: 0 } : { x: "-100%" }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-xs flex-col bg-surface shadow-layered"
            >
              <div className="flex items-center justify-between px-5 pb-4 pt-6">
                <Logo size="sm" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar menú"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
              <div className="mx-4 h-px rule-gold opacity-50" />

              <div className="flex-1 overflow-y-auto px-3 py-4">
                <NavLinks onNavigate={() => setOpen(false)} layoutId="nav-active-mobile" isAdmin={isAdmin} />
              </div>

              <div className="mx-4 h-px bg-border" />
              <div className="p-3">
                <LogoutButton />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
