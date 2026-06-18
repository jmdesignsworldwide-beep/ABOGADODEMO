"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * MagneticCard — tarjeta premium con hover magnético.
 * Al pasar el cursor: escala sutil + elevación + una inclinación 3D muy leve
 * que "sigue" al puntero, y un brillo (sheen) que se mueve. En táctil/reduced
 * motion se desactiva el seguimiento y queda como tarjeta de cristal estática.
 *
 * Reutilizable en todos los módulos como contenedor de contenido.
 *
 * Props:
 *  - glow: añade glow dorado al hacer hover
 *  - interactive: activa el seguimiento magnético (default true)
 */
export function MagneticCard({
  children,
  className,
  glow = false,
  interactive = true,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Posición del puntero normalizada (-0.5 .. 0.5)
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Inclinación muy sutil (±2°, apenas perceptible) y spring controlado
  // (sin rebote) para una sensación premium y sobria, no "de gelatina".
  const tiltSpring = { stiffness: 300, damping: 40, mass: 0.8 } as const;
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [2, -2]), tiltSpring);
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-2, 2]), tiltSpring);

  // Brillo que sigue al cursor (todos los hooks a nivel superior).
  const sheenX = useTransform(px, [-0.5, 0.5], ["0%", "100%"]);
  const sheenY = useTransform(py, [-0.5, 0.5], ["0%", "100%"]);
  const sheen = useMotionTemplate`radial-gradient(380px circle at ${sheenX} ${sheenY}, var(--sheen), transparent 60%)`;

  const enabled = interactive && !reduced;

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function handleLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={onClick}
      style={
        enabled
          ? { rotateX: rx, rotateY: ry, transformPerspective: 1000 }
          : undefined
      }
      whileHover={reduced ? undefined : { scale: 1.008, y: -3 }}
      transition={tiltSpring}
      className={cn(
        "group/card relative overflow-hidden rounded-2xl glass shadow-layered",
        "transition-shadow duration-300",
        glow && "hover:glow-gold",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {/* Borde superior con destello dorado al hover */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px rule-gold opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

      {/* Sheen que sigue al puntero */}
      {enabled && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
          style={{ background: sheen }}
        />
      )}

      <div className="relative">{children}</div>
    </motion.div>
  );
}
