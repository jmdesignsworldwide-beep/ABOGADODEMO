import { cn } from "@/lib/utils";

/** Iniciales a partir de un nombre (máx. 2 letras). */
export function initials(nombre: string): string {
  return nombre
    .replace(/[,.]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Avatar de iniciales con sello marino/dorado. */
export function Avatar({
  nombre,
  className,
  size = "md",
}: {
  nombre: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sz = {
    sm: "h-9 w-9 text-xs rounded-lg",
    md: "h-11 w-11 text-sm rounded-xl",
    lg: "h-16 w-16 text-xl rounded-2xl",
  }[size];

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center bg-navy font-display font-semibold text-gold-on-navy ring-1 ring-[var(--gold-on-navy)]/25",
        sz,
        className,
      )}
    >
      {initials(nombre)}
    </span>
  );
}
