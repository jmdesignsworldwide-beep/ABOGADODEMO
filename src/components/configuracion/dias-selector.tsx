"use client";

import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type DiasMode = "7" | "15" | "30" | "custom" | "sin";

/** Resuelve el modo + valor personalizado a un número de días o null. */
export function resolveDias(mode: DiasMode, custom: number): number | null {
  if (mode === "sin") return null;
  if (mode === "custom") return Math.max(1, Math.round(custom || 0));
  return Number(mode);
}

const OPTIONS: { value: DiasMode; label: string }[] = [
  { value: "7", label: "7 días" },
  { value: "15", label: "15 días" },
  { value: "30", label: "30 días" },
  { value: "custom", label: "Personalizado" },
  { value: "sin", label: "Sin vencimiento" },
];

export function DiasSelector({
  mode,
  custom,
  onMode,
  onCustom,
  label = "Días de acceso",
}: {
  mode: DiasMode;
  custom: number;
  onMode: (m: DiasMode) => void;
  onCustom: (n: number) => void;
  label?: string;
}) {
  return (
    <Field label={label} htmlFor="dias-grid">
      <div id="dias-grid" className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onMode(o.value)}
            className={cn(
              "rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
              mode === o.value
                ? "border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {mode === "custom" && (
        <Input
          type="number"
          min={1}
          value={custom || ""}
          onChange={(e) => onCustom(Number(e.target.value))}
          placeholder="Número de días"
          className="mt-2"
          aria-label="Número de días personalizado"
        />
      )}
    </Field>
  );
}
