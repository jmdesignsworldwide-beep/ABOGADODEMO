"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Toggle sol/luna. Anima el cambio de icono y recuerda la preferencia
 * (vía next-themes). Accesible: botón con aria-label dinámico.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();

  // Patrón oficial de next-themes: el tema solo se conoce en el cliente, así
  // que esperamos al montaje para evitar mismatch de hidratación. El setState
  // único en montaje es intencional aquí.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className={cn(
        "group relative inline-flex h-10 w-10 items-center justify-center rounded-xl",
        "glass text-foreground/80 transition-colors hover:text-gold",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        className,
      )}
    >
      <span className="sr-only">Cambiar tema</span>
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={reduced ? false : { opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inline-flex"
          >
            {isDark ? (
              <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            ) : (
              <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} />
            )}
          </motion.span>
        )}
      </AnimatePresence>
      {/* Glow al pasar el cursor */}
      <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:glow-gold" />
    </button>
  );
}
