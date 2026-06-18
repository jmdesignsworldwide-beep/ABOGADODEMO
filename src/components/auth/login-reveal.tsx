"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { springSoft } from "@/lib/motion";

/** Entrada elegante de la tarjeta de login (fade + subida + leve blur). */
export function LoginReveal({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduced ? { duration: 0.2 } : { ...springSoft, delay: 0.05 }}
      className="relative z-10 w-full"
      style={{ display: "grid", placeItems: "center" }}
    >
      {children}
    </motion.div>
  );
}
