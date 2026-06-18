import { Info } from "lucide-react";

/**
 * Disclaimer fiscal del módulo de Facturación. Sutil y elegante, pero
 * siempre visible: deja claro que los NCF son simulados (demostración).
 */
export function DisclaimerBanner() {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] px-3.5 py-2.5 text-sm">
      <Info className="h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
      <p className="text-foreground/80">
        <span className="font-semibold text-gold">NCF simulado — demostración.</span>{" "}
        No certificado ante la DGII.
      </p>
    </div>
  );
}
