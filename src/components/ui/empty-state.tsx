import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Estado vacío elegante (sin datos / sin resultados de búsqueda). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold">
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
