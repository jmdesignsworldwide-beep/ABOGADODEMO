import type { ReactNode } from "react";
import { ContratosDisclaimer } from "@/components/contratos/disclaimer-banner";

export default function ContratosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-5">
      <ContratosDisclaimer />
      {children}
    </div>
  );
}
