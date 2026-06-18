"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * CountUp — número que cuenta hacia arriba cuando entra en pantalla.
 * Tabular por defecto para que no "baile" el ancho. Soporta prefijo/sufijo,
 * decimales y separador de miles (es-DO). Respeta reduced-motion (muestra
 * el valor final directo).
 */
export function CountUp({
  value,
  duration = 1.4,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // Una sola ruta: animate con duración 0 cuando se reduce el movimiento,
    // así el estado se actualiza dentro del callback (no en el cuerpo del efecto).
    const controls = animate(0, value, {
      duration: reduced ? 0 : duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduced]);

  const formatted = display.toLocaleString("es-DO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
