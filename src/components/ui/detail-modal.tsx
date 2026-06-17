"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
   Detalle premium reutilizable.
   Patrón "nada es un clic muerto": cualquier tarjeta/KPI/acción abre este
   panel con su contenido. Donde aún no hay destino real, muestra un
   placeholder elegante (no un error, no un clic vacío).
   Uso:
     const { open } = useDetail();
     open({ kind, title, subtitle, meta, note })
   ───────────────────────────────────────────────────────────────────────── */

export type DetailContent = {
  kind?: "audiencia" | "plazo" | "caso" | "kpi" | "accion";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent?: "gold" | "navy" | "critical";
  meta?: { label: string; value: string }[];
  note?: string;
  cta?: string;
};

type Ctx = { open: (c: DetailContent) => void; close: () => void };
const DetailCtx = createContext<Ctx | null>(null);

export function useDetail() {
  const ctx = useContext(DetailCtx);
  if (!ctx) throw new Error("useDetail debe usarse dentro de <DetailProvider>");
  return ctx;
}

export function DetailProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<DetailContent | null>(null);
  const reduced = useReducedMotion();

  const open = useCallback((c: DetailContent) => setContent(c), []);
  const close = useCallback(() => setContent(null), []);

  // Bloquear scroll + cerrar con Escape
  useEffect(() => {
    if (!content) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [content, close]);

  const accent = content?.accent ?? "gold";
  const accentText =
    accent === "critical" ? "text-critical" : accent === "navy" ? "text-foreground" : "text-gold";

  return (
    <DetailCtx.Provider value={{ open, close }}>
      {children}

      <AnimatePresence>
        {content && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={content.title}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className={cn(
                "relative z-10 w-full max-w-lg overflow-hidden rounded-t-3xl glass shadow-layered",
                "sm:rounded-3xl",
              )}
            >
              {/* Filo superior de color según acento */}
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{
                  background:
                    accent === "critical"
                      ? "linear-gradient(90deg,transparent,var(--critical),transparent)"
                      : accent === "navy"
                        ? "linear-gradient(90deg,transparent,var(--navy),transparent)"
                        : "linear-gradient(90deg,transparent,var(--gold),transparent)",
                }}
              />

              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {content.eyebrow && (
                      <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", accentText)}>
                        {content.eyebrow}
                      </p>
                    )}
                    <h2 className="mt-1.5 font-display text-2xl font-semibold leading-tight text-foreground">
                      {content.title}
                    </h2>
                    {content.subtitle && (
                      <p className="mt-1 text-sm text-muted-foreground">{content.subtitle}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Cerrar"
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                </div>

                {content.meta && content.meta.length > 0 && (
                  <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
                    {content.meta.map((m) => (
                      <div key={m.label} className="bg-surface p-3.5">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {m.label}
                        </dt>
                        <dd className="mt-0.5 text-sm font-medium text-foreground">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <p className="mt-5 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                  {content.note ??
                    "La vista detallada completa llegará en una próxima tanda. Por ahora este es un adelanto del flujo."}
                </p>

                <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                  <PremiumButton variant="ghost" onClick={close}>
                    Cerrar
                  </PremiumButton>
                  <PremiumButton
                    variant={accent === "critical" ? "primary" : "gold"}
                    onClick={close}
                    rightIcon={<ArrowUpRight className="h-4 w-4" />}
                  >
                    {content.cta ?? "Abrir detalle"}
                  </PremiumButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DetailCtx.Provider>
  );
}
