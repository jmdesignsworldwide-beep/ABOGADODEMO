"use client";

import { cn } from "@/lib/utils";

/**
 * Fondo Aurora que respira — lento y sutil, nunca distractor.
 * Tres manchas de color (marino + dorado) que se desplazan y "respiran"
 * con opacidad. Reutilizable: ponlo como capa de fondo en cualquier pantalla.
 *
 * Los colores salen de los tokens --aurora-1/2/3, así que cambian solos
 * entre tema claro y oscuro. Respeta prefers-reduced-motion (las animaciones
 * se congelan vía la regla global en globals.css).
 *
 * Uso:
 *   <div className="relative">
 *     <AuroraBackground />
 *     <div className="relative z-10"> ...contenido... </div>
 *   </div>
 */
export function AuroraBackground({
  className,
  interactive = false,
}: {
  className?: string;
  /** Si true, añade un leve grano para textura premium. */
  interactive?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* Base */}
      <div className="absolute inset-0 bg-background" />

      {/* Manchas de aurora */}
      <div
        className="absolute left-[-20%] top-[-25%] h-[70vmax] w-[70vmax] rounded-full blur-[100px]"
        style={{
          background:
            "radial-gradient(circle at center, var(--aurora-1), transparent 65%)",
          animation:
            "aurora-drift-1 26s ease-in-out infinite, aurora-breathe 11s ease-in-out infinite",
        }}
      />
      <div
        className="absolute right-[-15%] top-[-10%] h-[60vmax] w-[60vmax] rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at center, var(--aurora-2), transparent 65%)",
          animation:
            "aurora-drift-2 32s ease-in-out infinite, aurora-breathe 13s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-30%] left-[20%] h-[65vmax] w-[65vmax] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, var(--aurora-3), transparent 65%)",
          animation:
            "aurora-drift-3 29s ease-in-out infinite, aurora-breathe 15s ease-in-out infinite",
        }}
      />

      {/* Viñeta para profundidad */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, transparent 55%, rgba(0,0,0,0.18) 100%)",
        }}
      />

      {/* Grano sutil opcional */}
      {interactive && (
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      )}
    </div>
  );
}
