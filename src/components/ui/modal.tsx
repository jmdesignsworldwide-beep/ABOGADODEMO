"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modal premium controlado (open/onClose). Reutilizable para formularios,
 * confirmaciones y paneles. Glass, AnimatePresence, cierre por Escape/overlay,
 * bloqueo de scroll. En móvil aparece como hoja inferior; en desktop centrado.
 * Respeta prefers-reduced-motion.
 */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  accent = "gold",
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  accent?: "gold" | "navy" | "critical";
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const accentGradient =
    accent === "critical"
      ? "linear-gradient(90deg,transparent,var(--critical),transparent)"
      : accent === "navy"
        ? "linear-gradient(90deg,transparent,var(--navy),transparent)"
        : "linear-gradient(90deg,transparent,var(--gold),transparent)";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl glass shadow-layered sm:rounded-3xl",
              size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg",
            )}
          >
            <span className="absolute inset-x-0 top-0 h-1" style={{ background: accentGradient }} />

            <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-7">
              <div className="min-w-0">
                {eyebrow && (
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                    {eyebrow}
                  </p>
                )}
                <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-foreground">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-7">{children}</div>

            {footer && (
              <div className="border-t border-border px-6 py-4 sm:px-7">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
