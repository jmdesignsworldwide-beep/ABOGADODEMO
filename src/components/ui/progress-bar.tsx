"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * ProgressBar — barra que se llena animándose al entrar en pantalla.
 * Degradado marino→dorado, con un brillo en la punta. Accesible
 * (role=progressbar). Respeta reduced-motion (aparece llena sin animar).
 */
export function ProgressBar({
  value,
  label,
  showValue = true,
  className,
}: {
  /** 0–100 */
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const reduced = useReducedMotion();

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="tabular font-medium text-foreground">{pct}%</span>
          )}
        </div>
      )}
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          initial={{ width: reduced ? `${pct}%` : 0 }}
          animate={inView ? { width: `${pct}%` } : undefined}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative h-full rounded-full bg-[linear-gradient(90deg,var(--navy),var(--gold))]"
        >
          {/* Brillo en la punta */}
          <span className="absolute right-0 top-0 h-full w-6 rounded-full bg-[var(--sheen)] blur-[6px]" />
        </motion.div>
      </div>
    </div>
  );
}
