import { cn } from "@/lib/utils";

/**
 * Skeleton — placeholder de carga con un "shimmer" elegante (no un gris plano).
 * Usa la máscara de gradiente que recorre el bloque. Respeta reduced-motion
 * (la animación se congela vía globals.css).
 *
 * Variantes rápidas: <Skeleton className="h-4 w-32" /> etc.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/70",
        "after:absolute after:inset-0 after:-translate-x-full",
        "after:bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--gold)_18%,transparent),transparent)]",
        "after:animate-[shimmer_1.6s_infinite]",
        className,
      )}
    />
  );
}

/** Bloque de ejemplo para tarjetas (reutilizable en estados de carga). */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass rounded-2xl p-5 shadow-layered", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
