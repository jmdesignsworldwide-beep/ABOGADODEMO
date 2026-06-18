import { cn } from "@/lib/utils";

/**
 * Logo de marca "JM Design" con descriptor "Gestión Legal".
 * El monograma JM va en un sello con degradado dorado sobre marino.
 * Reutilizable: tamaños sm/md/lg, con o sin descriptor.
 */
export function Logo({
  className,
  size = "md",
  descriptor = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  descriptor?: boolean;
}) {
  const mark = {
    sm: "h-8 w-8 text-[13px] rounded-lg",
    md: "h-10 w-10 text-[15px] rounded-xl",
    lg: "h-14 w-14 text-xl rounded-2xl",
  }[size];

  const word = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Sello / monograma */}
      <div
        className={cn(
          "relative grid place-items-center font-display font-semibold tracking-tight",
          "bg-navy text-gold shadow-layered ring-1 ring-[var(--gold)]/30",
          mark,
        )}
      >
        <span className="relative z-10 text-gold-gradient">JM</span>
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60 glow-navy" />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-semibold tracking-tight text-foreground",
            word,
          )}
        >
          JM <span className="text-gold-gradient">Design</span>
        </span>
        {descriptor && (
          <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Gestión Legal
          </span>
        )}
      </div>
    </div>
  );
}
