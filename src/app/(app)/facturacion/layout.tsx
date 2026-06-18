import type { ReactNode } from "react";
import { DisclaimerBanner } from "@/components/facturacion/disclaimer-banner";

/** El disclaimer de NCF simulado va fijo arriba de TODO el módulo. */
export default function FacturacionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-5">
      <DisclaimerBanner />
      {children}
    </div>
  );
}
