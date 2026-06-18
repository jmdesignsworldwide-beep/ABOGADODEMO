"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/** Indica si el componente ya montó (evita SSR/hidratación en los charts). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  return mounted;
}

export type ChartTheme = {
  ingresos: string;
  egresos: string;
  balance: string;
  axis: string;
  grid: string;
  tooltipBg: string;
  tooltipBorder: string;
  text: string;
  categoria: string[];
};

const DARK: ChartTheme = {
  ingresos: "#34d399",
  egresos: "#f0a55e",
  balance: "#d4af37",
  axis: "#9aa3ba",
  grid: "rgba(176,192,228,0.12)",
  tooltipBg: "rgba(15,22,40,0.95)",
  tooltipBorder: "rgba(176,192,228,0.18)",
  text: "#e7eaf3",
  categoria: ["#2f6098", "#d4af37", "#34d399", "#f0a55e", "#5e9bd1", "#a78bfa", "#f0b86e", "#fb7185", "#94a3b8"],
};

const LIGHT: ChartTheme = {
  ingresos: "#059669",
  egresos: "#c2640f",
  balance: "#a9842b",
  axis: "#6f6a5e",
  grid: "rgba(40,52,78,0.12)",
  tooltipBg: "rgba(255,252,245,0.98)",
  tooltipBorder: "rgba(40,52,78,0.14)",
  text: "#1c2436",
  categoria: ["#1b3a5b", "#a9842b", "#059669", "#c2640f", "#2f6098", "#7c5cd6", "#ca8a04", "#e11d48", "#64748b"],
};

export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "light" ? LIGHT : DARK;
}

/** Formato compacto para ejes: RD$ 165k */
export function rdCompact(v: number): string {
  if (Math.abs(v) >= 1000) return `RD$ ${Math.round(v / 1000)}k`;
  return `RD$ ${v}`;
}
