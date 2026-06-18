import { Info } from "lucide-react";

/** Disclaimer fijo del módulo de documentos/contratos (siempre visible). */
export function ContratosDisclaimer() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] px-3.5 py-2.5 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
      <p className="text-foreground/80">
        <span className="font-semibold text-gold">Documentos de ejemplo para demostración.</span>{" "}
        No constituyen documentos legales válidos ni asesoría jurídica.
      </p>
    </div>
  );
}
