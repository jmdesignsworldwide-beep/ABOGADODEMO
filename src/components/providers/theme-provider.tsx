"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Proveedor de tema (oscuro / claro) con persistencia automática.
 * next-themes guarda la preferencia en localStorage y evita el "flash"
 * al cargar (ver el script en layout.tsx con suppressHydrationWarning).
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
