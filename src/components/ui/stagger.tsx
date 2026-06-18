"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeOnly, staggerContainer, staggerItem } from "@/lib/motion";

/**
 * Stagger — contenedor que revela a sus hijos en cascada (stagger 60–80ms)
 * con spring. Envuelve cada hijo en <StaggerItem>. Reutilizable para grids,
 * listas, secciones. Respeta reduced-motion (solo fade, sin desplazamiento).
 *
 * Uso:
 *   <Stagger className="grid gap-4">
 *     <StaggerItem><Card/></StaggerItem>
 *     <StaggerItem><Card/></StaggerItem>
 *   </Stagger>
 */
export function Stagger({
  children,
  className,
  stagger = 0.07,
  delayChildren = 0.05,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}) {
  return (
    <motion.div
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      animate="show"
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div variants={reduced ? fadeOnly : staggerItem} className={cn(className)}>
      {children}
    </motion.div>
  );
}
