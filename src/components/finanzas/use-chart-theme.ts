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
  ingresos: "#047857",
  egresos: "#c2410c",
  balance: "#a07d28",
  axis: "#585341",
  grid: "rgba(40,52,78,0.10)",
  tooltipBg: "rgba(252,248,240,0.98)",
  tooltipBorder: "rgba(164,126,40,0.28)",
  text: "#19223a",
  categoria: ["#1b3a5b", "#a07d28", "#047857", "#c2410c", "#2f6098", "#6d4ad1", "#b45309", "#be123c", "#5b6472"],
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
