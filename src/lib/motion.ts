import type { Transition, Variants } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────
   Configuración central de movimiento.
   Todos los primitivos beben de aquí para sentirse coherentes.
   Para respetar prefers-reduced-motion usa el hook useReducedMotion() de
   framer-motion en el componente y pásale `reduced` a estos helpers.
   ───────────────────────────────────────────────────────────────────────── */

/** Spring suave y "premium" — base de casi todo. */
export const springSoft: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

/** Spring con un poco más de rebote, para hovers magnéticos. */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 26,
  mass: 0.6,
};

/** Curva de easing elegante para fades/translates simples. */
export const easeElegant: Transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
};

/* ── Entrada en cascada (stagger) ───────────────────────────────────────── */

/** Contenedor: orquesta a los hijos con un retraso entre cada uno. */
export function staggerContainer(stagger = 0.07, delayChildren = 0.04): Variants {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };
}

/** Item: aparece desde abajo con spring. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: springSoft,
  },
};

/** Variante reducida: solo opacidad, sin desplazamiento. */
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

/* ── Transición entre vistas (AnimatePresence) ──────────────────────────── */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ...easeElegant, duration: 0.4 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};
